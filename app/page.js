'use client'

import React, { useState, useEffect } from 'react'
import { generateMnemonic, mnemonicToSeed } from "bip39";
import { motion } from "framer-motion"
import { derivePath } from "ed25519-hd-key";
import { SiBlockchaindotcom } from "react-icons/si";
import { PiEye, PiEyeSlash } from "react-icons/pi";
import { FaRegCopy, FaEthereum } from "react-icons/fa";
import { MdColorLens } from "react-icons/md"; // Unique icon for theme change
import { Keypair } from '@solana/web3.js'
import nacl from "tweetnacl"
import { Wallet, HDNodeWallet } from "ethers";
import { ToastContainer, toast } from 'react-toastify'; // Import ToastContainer and toast
import 'react-toastify/dist/ReactToastify.css'; // Import toast styles

const themes = [
  'light', 'dark', 'cupcake', 'bumblebee', 'emerald', 'corporate', 'synthwave', 'retro', 'cyberpunk', 'valentine', 'halloween', 'garden', 'forest', 'aqua', 'lofi', 'pastel', 'fantasy', 'wireframe', 'black', 'luxury', 'dracula', 'cmyk', 'autumn', 'business', 'acid', 'lemonade', 'night', 'coffee', 'winter'
];

const Page = () => {
  const [mnemonic, setMnemonic] = useState("");
  const [solIndex, setSolIndex] = useState(0);
  const [ethIndex, setEthIndex] = useState(0);
  const [wallets, setWallets] = useState([]);
  const [view, setView] = useState(true);
  const [showPrivateKeys, setShowPrivateKeys] = useState({});
  const [currentTheme, setCurrentTheme] = useState('cyberpunk'); // Set initial theme to cyberpunk

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', currentTheme);
  }, [currentTheme]);

  async function handleGenerateSeedPhrase() {
    const getMm = await generateMnemonic();
    setMnemonic(getMm);
  }

  function copyWord() {
    navigator.clipboard.writeText(mnemonic);
    toast.success('Seed phrase copied to clipboard!', {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  }

  function handleGenerateSolanaWallet() {
    const seed = mnemonicToSeed(mnemonic);
    const path = `m/44'/501'/${solIndex}'/0'`;
    const derivedSeed = derivePath(path, seed.toString("hex")).key;
    const secret = nacl.sign.keyPair.fromSeed(derivedSeed).secretKey;
    const keypair = Keypair.fromSecretKey(secret);
    setSolIndex(solIndex + 1);
    let keys = {
      publicKey: keypair.publicKey.toBase58(),
      secretKey: Keypair.fromSecretKey(secret).publicKey.toBase58(),
      chain: 'Solana'
    };
    setWallets([...wallets, keys]);
  }

  async function handleGenerateEthereumWallet() {
    const seed = await mnemonicToSeed(mnemonic);
    const derivationPath = `m/44'/60'/${ethIndex}'/0'`;
    const hdNode = HDNodeWallet.fromSeed(seed);
    const child = hdNode.derivePath(derivationPath);
    const privateKey = child.privateKey;
    const ethWallet = new Wallet(privateKey);
    setEthIndex(ethIndex + 1);
    let keys = {
      publicKey: ethWallet.address,
      secretKey: ethWallet.privateKey,
      chain: 'Ethereum'
    };
    setWallets([...wallets, keys]);
  }

  const togglePrivateKeyVisibility = (index) => {
    setShowPrivateKeys(prevState => ({
      ...prevState,
      [index]: !prevState[index]
    }));
  };

  const changeTheme = () => {
    const nextThemeIndex = (themes.indexOf(currentTheme) + 1) % themes.length;
    const nextTheme = themes[nextThemeIndex];
    setCurrentTheme(nextTheme);
  };

  return (
    <div className='max-w-[1200px] w-full mx-auto p-4'>
      <ToastContainer />
      <motion.nav initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} className='w-full my-4 mt-8 flex justify-between items-center'>
        <div className='flex items-center gap-4 font-bold font-mono text-3xl'>
          <SiBlockchaindotcom />
          <p>Peace Wallet</p>
        </div>
        <div>
          <motion.button whileHover={{ scale: 1.1, rotate: 10 }} className='btn btn-outline flex items-center gap-2' onClick={changeTheme}>
            <MdColorLens /> Change Theme
          </motion.button>
        </div>
      </motion.nav>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} className='w-full mt-8 text-center'>
        <p className='text-5xl font-extrabold mb-4'>Your Own <span className='text-gradient'>Web3</span> Wallet</p>
        <p className='text-3xl font-bold mb-8'>Support Both <span className='text-primary'>Solana</span> and <span className='text-secondary'>Ethereum</span></p>
        <motion.button whileHover={{ scale: 1.1 }} className='btn btn-outline mt-8' onClick={handleGenerateSeedPhrase}>
          <FaRegCopy /> Generate Phrase
        </motion.button>
      </motion.div>

      {mnemonic.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 80 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className='w-full pb-10 justify-around mt-5 mx-auto max-w-[800px] text-center px-12 bg-white bg-opacity-50 border-2 border-blue-500 gap-6 space-y-6 py-5 rounded-xl shadow-lg'>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2, delay: 1 }} className='w-full justify-end flex gap-4 items-center'>
            <div className='text-2xl cursor-pointer hover:text-primary' onClick={() => setView(!view)}>
              {view ? <PiEye /> : <PiEyeSlash />}
            </div>
            <div className='text-xl cursor-pointer hover:text-primary' onClick={copyWord}>
              <FaRegCopy />
            </div>
          </motion.div>
          <div className='grid grid-cols-4 gap-6'>
            {mnemonic.split(' ').map((ele, index) => (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 1 }} key={index} className={`bg-white text-black py-2 px-6 rounded-full hover:text-primary cursor-pointer ${view && 'blur-sm'}`}>
                {ele}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {mnemonic.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 2 }} className="flex gap-4 justify-center mt-8">
          <motion.button whileHover={{ scale: 1.1 }} className='btn btn-primary mt-8 flex items-center gap-2' onClick={handleGenerateSolanaWallet}>
            <SiBlockchaindotcom /> Generate Solana key pair
          </motion.button>
          <motion.button whileHover={{ scale: 1.1 }} className='btn btn-secondary mt-8 flex items-center gap-2' onClick={handleGenerateEthereumWallet}>
            <FaEthereum /> Generate Ethereum key pair
          </motion.button>
        </motion.div>
      )}

      <div className='mt-8 space-y-4'>
        {wallets.map((w, index) => (
          <motion.div 
            key={index} 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5 }} 
            className='bg-gray-800 shadow-lg rounded-lg p-6 w-full transform hover:scale-105 transition-transform duration-300'
          >
            <span className={`badge ${w.chain === 'Solana' ? 'bg-primary' : 'bg-secondary'}`}>{w.chain}</span>
            <div className='mt-4'>
              <label className='block font-bold text-white'>Public Key:</label>
              <input type='text' value={w.publicKey} readOnly className='w-full p-2 border rounded bg-white text-black' />
            </div>
            <div className='mt-4'>
              <label className='block font-bold text-white'>Secret Key:</label>
              <div className='flex items-center'>
                <input type={showPrivateKeys[index] ? 'text' : 'password'} value={w.secretKey} readOnly className='w-full p-2 border rounded bg-white text-black' />
                <button onClick={() => togglePrivateKeyVisibility(index)} className='ml-2 text-white'>
                  {showPrivateKeys[index] ? <PiEyeSlash /> : <PiEye />}
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default Page;