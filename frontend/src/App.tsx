import NavBar from "@/components/nav/NavBar.tsx";
// import PaginationBar from "@/components/pagination/PaginationBar.tsx";
import Games from "@/components/gameContainer/Games.tsx";

function App() {

  return (
  <div className={'flex flex-col flex-1 bg-zinc-800 text-zinc-100 text-lg font-semibold min-h-screen'}>
    <NavBar/>
    <Games/>
    {/*<PaginationBar/> INCASE YOU WANT TO DO THIS GO AHEAD GOT BORED HERE*/}
  </div>
  )
}

export default App
