import ConnectionButton from "@/components/nav/ConnectionButton.tsx";
import {useWallet} from "@solana/wallet-adapter-react";
import GameCreationModal from "@/components/modal/GameCreationModal.tsx";

function NavBar() {
  const {publicKey} = useWallet();
  const trimmedPublicKey = publicKey?publicKey.toBase58().slice(0, 4) + '...' + publicKey.toBase58().slice(-4):"";
  return (
    <div className={`flex justify-between px-4 py-2 w-screen items-center sticky top-0 border-b-2 border-b-blue-500
      bg-blue-900
    `}>
      <h4 className={'hidden md:inline-block'}>TIC TAC TOE</h4>
      <h4 className={'inline-block md:hidden'}>XO</h4>
      <div className={'flex flex-row gap-4 items-center'}>
        <h6 className={'text-md font-normal text-blue-300'}>{trimmedPublicKey}</h6>
        <ConnectionButton/>
      </div>
      <GameCreationModal/>
    </div>
  );
}

export default NavBar;