import {PublicKey} from "@solana/web3.js";

export interface Game {
  authority: PublicKey,
  board:Board,
  player2:PublicKey,
  winner:PublicKey,
  authorityTurn:boolean
  gameId:string,
  over:boolean
}
export type GameSign = {none:object} | {x:object} | {o:object}
export type Row = [GameSign,GameSign,GameSign]
export type Board = [Row,Row,Row]