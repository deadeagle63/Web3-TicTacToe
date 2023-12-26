import {Board, Game} from "@/type/game.ts";
import TicTacToeRow from "@/components/gameContainer/TicTacToeRow.tsx";
import {Label} from "../ui/label";
import {useWallet} from "@solana/wallet-adapter-react";
import {Button} from "@/components/ui/button.tsx";
import {useCallback, useEffect, useState} from "react";
import {useTicTacToe, useTicTacToeAccount} from "@/data/programs/tictactoe.ts";
import {PublicKey} from "@solana/web3.js";
import {Link, Trash} from "lucide-react";
import {openExplorerLink} from "@/utils/linkHandlers.ts";
import Tooltip from "@/components/ui/tooltip.tsx";
import {TooltipContent, TooltipTrigger} from "@/components/ui/shadTooltip.tsx";

interface TicTacToeProps {
  game: Game;
  account: PublicKey;
}

function TicTacToe({game, account}: TicTacToeProps) {
  const [board, setBoard] = useState(() => game.board)
  const [authorityTurn, setAuthorityTurn] = useState(() => game.authorityTurn)
  const [player2, setPlayer2] = useState(() => game.player2)
  const [winner, setWinner] = useState(() => game.winner)
  const [over, setOver] = useState(() => game.over)
  const wallet = useWallet()
  const {xoProgram} = useTicTacToe()
  const {closeGame, joinGame, leaveGame} = useTicTacToeAccount({game: account})
  const canJoin = wallet.publicKey && !(game.authority.equals(wallet.publicKey) || player2.equals(wallet.publicKey)) || false
  const handleJoin = useCallback(async () => {
    if (!wallet.publicKey) return;
    await joinGame.mutateAsync(game.gameId)
  }, [joinGame, game, wallet])
  const handleClose = useCallback(async () => {
    if (!wallet.publicKey) return;
    await closeGame.mutateAsync(game.gameId)
    
  }, [closeGame, game, wallet])
  const handleLeave = useCallback(async () => {
    if (!wallet.publicKey) return
    await leaveGame.mutateAsync(game.gameId)
  }, [leaveGame, game, wallet])
  useEffect(() => {
    if (!xoProgram) return;
    const id = xoProgram.addEventListener("GameState", (event) => {
      if (game.gameId == event.gameId) {
        setBoard(event.board as Board)
        setAuthorityTurn(event.authorityTurn)
      }
    });
    const id2 = xoProgram.addEventListener("GameJoined", (event) => {
      if (game.gameId == event.gameId) {
        setPlayer2(event.player2)
      }
    })
    const id3 = xoProgram.addEventListener("GameOver", (event) => {
      if (game.gameId == event.gameId) {
        setWinner(event.winner)
        setOver(true)
      }
    })
    const id4 = xoProgram.addEventListener("GameLeft", (event) => {
      if (game.gameId == event.gameId) {
        setPlayer2(PublicKey.default)
        setWinner(PublicKey.default)
        setOver(false)
        setBoard(event.board as Board)
      }
    })
    return () => { // Unsubscribe
      void xoProgram.removeEventListener(id);
      void xoProgram.removeEventListener(id2);
      void xoProgram.removeEventListener(id3);
      void xoProgram.removeEventListener(id4);
      
    }
    
  }, [xoProgram, game.gameId])
  
  return (
    <div className={`flex flex-col gap-1 relative`}>
      <div className={`flex justify-between items-center h-6`}>
        <Label className={'uppercase'}>{game.gameId}</Label>
        <div className={'flex gap-2'}>
          {wallet.publicKey && game.authority.equals(wallet.publicKey) &&
            <Tooltip>
              <TooltipTrigger asChild>
                <Button className={'group w-5 h-5'}
                        variant={'icon'}
                        size={'icon'}
                        onClick={handleClose}
                >
                  <Trash className={'group-hover:size-5 transition-all duration-300 ease-in-out stroke-red-500' +
                    ' group-hover:stroke-red-300'} size={16}/>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <div className={'p-4 bg-slate-600 rounded-md text-lg text-white max-w-[300px] text-wrap'}>
                  Delete game {game.gameId}
                </div>
              </TooltipContent>
            </Tooltip>
          }
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant={'icon'} className={'group w-5 h-5'}
                      size={'icon'}
                      onClick={() => openExplorerLink(account.toBase58(), {txType: "address"})}><Link
                className={'group-hover:size-5 transition-all duration-300 ease-in-out group-hover:stroke-blue-200'}
                size={16}/></Button>
            </TooltipTrigger>
            <TooltipContent className={''}>
              <div className={'p-4 bg-slate-600 rounded-md text-lg text-white max-w-[300px] text-wrap break-words'}>View
                account {account.toBase58()}
              </div>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
      {over &&
        <Tooltip>
          <TooltipTrigger>
            <p className={`text-white absolute top-1/2 left-1/2 -translate-x-1/2 z-10 bg-black rounded-lg
        -translate-y-1/2`}>GAME OVER</p>
          </TooltipTrigger>
          <TooltipContent>
            <div className={'p-4 bg-slate-600 rounded-md text-lg text-white max-w-[300px] text-wrap'}>
              {winner.equals(PublicKey.default) ? "Draw" : wallet.publicKey && winner.equals(wallet.publicKey) ? "You" +
                " won" : "You" +
                " lost"}
            </div>
          </TooltipContent>
        </Tooltip>}
      <div className={`grid grid-cols-3 grid-rows-3 gap-x-2 gap-y-2  w-max`}>
        {board.map((row, rowIndex) => {
          return <TicTacToeRow key={rowIndex} gameAccount={account}
                               gameId={game.gameId}
                               authorityTurn={authorityTurn}
                               player2={player2}
                               row={row}
                               rowIndex={rowIndex}
                               authority={game.authority}
                               winner={winner}
                               over={over}
          />
        })}
      </div>
      <div className={'flex justify-between mt-2'}>
        {canJoin &&
          <Button className={`bg-green-500 ml-auto`}
                  onClick={handleJoin}
          >Join
          </Button>}
        {winner.equals(PublicKey.default) &&!over &&
          wallet.publicKey &&
          (player2.equals(wallet.publicKey) || game.authority.equals(wallet.publicKey)) &&
          <Button className={`bg-red-500 ml-auto`}
                  onClick={handleLeave}
          >Leave
          </Button>}
      </div>
    </div>
  );
}

export default TicTacToe;