import TicTacToe from "@/components/gameContainer/TicTacToe.tsx";
import {useTicTacToe} from "@/data/programs/tictactoe.ts";
import {useEffect} from "react";
function Games() {
  const {accounts,xoProgram} = useTicTacToe()
  console.log(accounts)
  useEffect(() => {
      const id = xoProgram.addEventListener("GameCreated",()=>accounts.refetch())
      const id2 = xoProgram.addEventListener("GameClosed",()=>accounts.refetch())
    return()=> {
      void xoProgram.removeEventListener(id)
      void xoProgram.removeEventListener(id2)
    }
  }, [accounts,xoProgram]);
  return (
    <div className={`flex flex-wrap gap-4 p-2 md:p-8`}>
      {
        accounts.isLoading? <p>Loading...</p>:
          accounts.data?.length==0?<p>No games found</p>:
            accounts.data?.map((game)=>{
              return <TicTacToe key={`${game.account.gameId}_${game.publicKey.toBase58()}`} account={game.publicKey} game={game.account}/>
            })
      }
    </div>
  );
}

export default Games;