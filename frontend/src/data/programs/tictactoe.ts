import { PublicKey, SystemProgram, Transaction} from "@solana/web3.js";
import {AnchorProvider, Program} from "@coral-xyz/anchor";
import {IDL} from "@/idl/types/tictactoe.ts";

import {AnchorWallet, useConnection, useWallet} from "@solana/wallet-adapter-react";
import {useMutation, useQuery} from "@tanstack/react-query";
import {toast} from "sonner";
import {openExplorerLink} from "@/utils/linkHandlers.ts";

const progamId = new PublicKey('EqkbdxDJU4sc4LAvDykEagPZ51VTnNZAp5rcHYgo3tde');
const cluster = {
  name: "LocalNet",
    endpoint: "htto://localhost:8899",
    network: "localnet",
    active: true
}
export function useTicTacToe() {
  const wallet = useWallet();
  const {connection} = useConnection();
  const provider = new AnchorProvider(connection, wallet as AnchorWallet, {commitment: 'confirmed'})
  const xoProgram = new Program(IDL, progamId, provider)
  
  const accounts = useQuery({
    queryKey: ['game', 'all', { cluster }],
    queryFn: () => xoProgram.account.game.all(),
  });
  
  const createGame = useMutation({
    mutationKey: ['game', 'create', { cluster }],
    mutationFn: async (gameId:string) => {
      if(!wallet.publicKey)throw new Error("Wallet not connected");
     const inst = await xoProgram.methods
        .createGame(gameId)
        .accounts({
          game:getGameKey(gameId,wallet.publicKey)[0],
          signer:wallet.publicKey,
          systemProgram:SystemProgram.programId
        })
       .instruction()
      const tx= await wallet.sendTransaction(new Transaction().add(inst),connection)
      await connection.confirmTransaction(tx)
      return tx    },
    onSuccess: (signature:string) => {
      toast("Game created!",{
        action:{
          label:"View On Explorer",
          onClick:()=>openExplorerLink(signature)
        }
      });
      return accounts.refetch();
    },
    onError: () => toast.error('Failed to create game'),
  });
  return {xoProgram, provider, accounts,createGame};
}
export function useTicTacToeAccount({game}:{game:PublicKey}){
  const wallet = useWallet();
  const {connection} = useConnection()
  const {xoProgram,accounts} = useTicTacToe()
  const account = useQuery({
    queryKey: ['game', 'fetch', { cluster, game }],
    queryFn: () => xoProgram.account.game.fetch(game),
  });
  const joinGame = useMutation({
    mutationKey: ['game', 'joinGame', { cluster, game }],
    mutationFn: async (gameId:string) => {
      if(!wallet.publicKey)throw new Error("Wallet not connected");
      const inst = await xoProgram.methods.joinGame(gameId).accounts({
        game,
        signer:wallet.publicKey,
        gameOwner:account.data?.authority
      }).instruction();
      const tx= await wallet.sendTransaction(new Transaction().add(inst),connection)
      await connection.confirmTransaction(tx)
      return tx
    },
    onSuccess: (signature:string) => {
      toast("Game joined!",{
        action:{
          label:"View On Explorer",
          onClick:()=>openExplorerLink(signature)
        }
      });
      return account.refetch();
    },
    onError: () => toast.error('Failed to join game'),
  });
  const playMove = useMutation({
    mutationKey: ["game","playMove",{cluster,game}],
    mutationFn: async ({gameId, move}:{gameId:string, move:[number,number]})=>{
      if(!wallet.publicKey)throw new Error("Wallet not connected");
      const inst = await xoProgram.methods.play(gameId,move).accounts({
        game,
        signer:wallet.publicKey,
        gameOwner:account.data?.authority
      }).instruction();
      const tx= await wallet.sendTransaction(new Transaction().add(inst),connection)
      await connection.confirmTransaction(tx)
      return tx    },
    onSuccess: (signature:string) => {
      toast("Move played!",{
        action:{
          label:"View On Explorer",
          onClick:()=>openExplorerLink(signature)
        }
      });
      return account.refetch();
    },
    onError: () => toast.error('Failed to play move'),
  })
  const leaveGame = useMutation({
    mutationKey: ["game","leaveGame",{cluster,game}],
    mutationFn: async (gameId:string)=>{
      if(!wallet.publicKey)throw new Error("Wallet not connected");
      const inst = await xoProgram.methods.leaveGame(gameId).accounts({
        game,
        signer:wallet.publicKey,
        gameOwner:account.data?.authority
      }).instruction();
      const tx= await wallet.sendTransaction(new Transaction().add(inst),connection)
      await connection.confirmTransaction(tx)
      return tx    },
    onSuccess: (signature:string) => {
      toast("Game left!",{
        action:{
          label:"View On Explorer",
          onClick:()=>openExplorerLink(signature)
        }
      });
      return account.refetch();
    },
    onError: () => toast.error('Failed to leave game'),
  })
  const closeGame = useMutation({
    mutationKey: ["game","closeGame",{cluster,game}],
    mutationFn: async (gameId:string)=>{
      if(!wallet.publicKey)throw new Error("Wallet not connected");
      const inst = await xoProgram.methods.closeGame(gameId).accounts({
        game,
        signer:wallet.publicKey,
      }).instruction();
      const tx= await wallet.sendTransaction(new Transaction().add(inst),connection)
      await connection.confirmTransaction(tx)
      return tx    },
    onSuccess: (signature:string) => {
      toast("Game closed!",{
        action:{
          label:"View On Explorer",
          onClick:()=>openExplorerLink(signature)
        }
      });
      return accounts.refetch();
    },
    onError: () => toast.error('Failed to close game'),
  })
  
  return {account,joinGame,playMove,leaveGame,closeGame}
}
function getGameKey(gameId: string, ownerKey: PublicKey) {
  return PublicKey.findProgramAddressSync([Buffer.from(gameId), ownerKey.toBuffer()], progamId);
}
