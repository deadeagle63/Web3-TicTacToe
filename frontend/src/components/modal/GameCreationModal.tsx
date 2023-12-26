import {
  Dialog,
  DialogContent,
  DialogDescription, DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog.tsx";
import {Input} from "@/components/ui/input.tsx";
import {useCallback, useState} from "react";
import {Button} from "@/components/ui/button.tsx";
import {Label} from "@/components/ui/label.tsx";
import {useWallet} from "@solana/wallet-adapter-react";
import ConnectionButton from "@/components/nav/ConnectionButton.tsx";
import {useTicTacToe} from "@/data/programs/tictactoe.ts";

function GameCreationModal() {
  const [showModal,setShowModal] = useState(false);
  const [gameId,setGameId] = useState('')
  const {connected,publicKey}=useWallet()
  const hasError = gameId.trim().length==0
  const {createGame} = useTicTacToe()
  const handleCreateGame = useCallback(async ()=>{
    if(!connected || !publicKey)return;
     await createGame.mutateAsync(gameId)
    setShowModal(false)
  },[createGame,gameId,connected,publicKey])
  return (
    <Dialog open={showModal} onOpenChange={(v)=>setShowModal(v)}>
      <DialogTrigger>
        <Button >Create Game</Button>
      </DialogTrigger>
      <DialogContent className={'rounded-sm bg-blue-600 text-lg font-semibold border-blue-500 text-blue-100'}>
        <DialogHeader>
          <DialogTitle className={'text-blue-50'}>You are about to create a game, are you sure?</DialogTitle>
          <DialogDescription className={'p-2 gap-4 flex flex-col text-blue-100'}>
            <p>
              This will create a new game with the current id. You cannot change these later.
            </p>
            <div className={'flex items-start flex-col gap-2'}>
              <Label>Game Id</Label>
              <Input
                className={'rounded-2xl ring-offset-blue-500 focus-visible:ring-blue-200 text-blue-900'}
               onChange={(e)=>setGameId(e.target.value)}/>
              {hasError&&<p className={'text-white'}><strong className={'text-red-500'}>*&nbsp;</strong>Game Id cannot be empty</p>}
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          {connected?<div className={'flex flex-row gap-4'}>
            <DialogTrigger asChild>
              <Button variant={'destructive'}>Cancel</Button>
            </DialogTrigger>
            <Button onClick={handleCreateGame} className={'disabled:cursor-not-allowed'} variant={'default'} disabled={hasError}>Create</Button>
          </div>:<ConnectionButton/>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default GameCreationModal;