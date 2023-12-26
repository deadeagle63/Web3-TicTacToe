import {Game, GameSign, Row} from "@/type/game.ts";
import {useCallback} from "react";
import {useWallet} from "@solana/wallet-adapter-react";
import { useTicTacToeAccount} from "@/data/programs/tictactoe.ts";
import {Button} from "@/components/ui/button.tsx";
import {PublicKey} from "@solana/web3.js";

interface TicTacToeRowProps extends Omit<Game, "board"> {
  row: Row;
  rowIndex: number;
  gameAccount: PublicKey;
}

function TicTacToeRow({authority, authorityTurn, player2, gameId, winner,gameAccount, row, rowIndex}: TicTacToeRowProps) {
  const wallet = useWallet();
  const {playMove} = useTicTacToeAccount({game:gameAccount})
  const handlePlay = useCallback((rowIndex: number, cellIndex: number) =>  {
    return async () => {
      if (!wallet.publicKey) return;
       await playMove.mutateAsync({gameId, move:[rowIndex, cellIndex]})
    }
  }, [playMove, wallet, gameId])
  const canPlay = wallet.publicKey &&
    ((authority.equals(wallet.publicKey) && authorityTurn && !player2.equals(PublicKey.default)) || (player2.equals(wallet.publicKey) && !authorityTurn))
    && winner.equals(PublicKey.default)
    || false
  
  return (
    <>
      {row.map((cell, cellIndex) => {
        
        const cellText=getCellAsText(cell);
        
        return (
          <Button key={cellIndex}
                  className={`rounded-lg w-10 h-10 border-2 border-slate-200 flex items-center justify-center hover:bg-slate-200 cursor-pointer`}
                  onClick={handlePlay(rowIndex, cellIndex)}
                  disabled={!canPlay || Boolean(cellText)}
          >
            {cellText}
          </Button>
        );
      })}
    </>
  );
}

const getCellAsText = (cell: GameSign) => {
  const cText = Object.keys(cell)[0];
  return cText == "none" ? '' : cText.toUpperCase()
}
export default TicTacToeRow;