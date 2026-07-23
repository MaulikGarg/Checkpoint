import { useEffect, useState } from "react";
import { type Game } from "./types/game";
import { getGames } from "./api/game";

function App() {
  const [games, setGames] = useState<Game[]>([]);

  useEffect(()=>{
    getGames().then(setGames).catch(console.error);
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold text-blue-600">Checkpoint</h1>
      <pre>{JSON.stringify(games, null, 2)}</pre>
    </div>
  );
}

export default App;