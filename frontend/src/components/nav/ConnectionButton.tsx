import {Button} from "@/components/ui/button.tsx";
import {useWallet} from "@solana/wallet-adapter-react";
import {useEffect} from "react";
import {useWalletModal} from "@solana/wallet-adapter-react-ui";

function ConnectionButton() {
  const {connected,select,disconnect,wallet,connect} = useWallet();
  const {setVisible} = useWalletModal();
  useEffect(() => {
    if(wallet==null)return;
    select(wallet.adapter.name)
     connect()
  }, [wallet,connect,select]);
  return (
    <Button
      onClick={connected?disconnect:()=> setVisible(true)
      }
      className={'rounded-full border-2 border-blue-500 hover:bg-blue-500 hover:text-white'}>{connected?'Disconnect':"Connect Wallet"}</Button>
  );
}

export default ConnectionButton;