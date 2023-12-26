import { signal } from "@preact/signals-react";
import {Game} from "@/type/game.ts";

export const games = signal<Game[]>([]);
