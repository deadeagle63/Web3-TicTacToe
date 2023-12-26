import * as anchor from "@coral-xyz/anchor";
import {Program, Wallet} from "@coral-xyz/anchor";
import {Tictactoe} from "../target/types/tictactoe";
import {
    Connection,
    Keypair,
    LAMPORTS_PER_SOL,
    PublicKey,
    sendAndConfirmTransaction,
    SystemProgram, Transaction
} from "@solana/web3.js";
import {expect} from "chai";

describe("tictactoe", () => {
    // Configure the client to use the local cluster.
    anchor.setProvider(anchor.AnchorProvider.env());
    const connection = anchor.getProvider().connection;
    const [player1] = createWallet()
    const [player2] = createWallet()
    const [player3] = createWallet()
    const program = anchor.workspace.Tictactoe as Program<Tictactoe>;
    const [gameBase] = PublicKey.findProgramAddressSync([
        Buffer.from("game_1", "utf-8"),
        player1.publicKey.toBuffer()
    ], program.programId)

    before(async () => {
        await Promise.allSettled([topUp(connection, player1), topUp(connection, player2),topUp(connection, player3)])
    })
    it("Is initialized!", async () => {

        // Add your test here.
        let tx = await program.methods.createGame("game_1")
            .accounts({
                game: gameBase,
                signer: player1.publicKey,
                systemProgram: SystemProgram.programId
            })
            .signers([player1.payer])
            .rpc();
        console.log("Your transaction signature - create", tx);
        // close test
        tx = await program.methods.closeGame("game_1")
            .accounts({
                game: gameBase,
                signer: player1.publicKey,
                systemProgram: SystemProgram.programId
            })
            .signers([player1.payer])
            .rpc();
        console.log("Your transaction signature - close", tx);
        tx = await program.methods.createGame("game_1")
            .accounts({
                game: gameBase,
                signer: player1.publicKey,
                systemProgram: SystemProgram.programId
            })
            .signers([player1.payer])
            .rpc();
        console.log("Your transaction signature - create (again)", tx);
        // leave which is close test
        const inst = await program.methods.leaveGame("game_1")
            .accounts({
                game: gameBase,
                signer: player1.publicKey,
                gameOwner: player1.publicKey,
                systemProgram: SystemProgram.programId
            })
            .instruction()
        tx = await sendAndConfirmTransaction(connection,new Transaction().add(inst),[player1.payer],{skipPreflight:true})
            // .signers([player1.payer])
            // .rpc();
        console.log("Your transaction signature - leave (close game)", tx);
        tx = await program.methods.createGame("game_1")
            .accounts({
                game: gameBase,
                signer: player1.publicKey,
                systemProgram: SystemProgram.programId
            })
            .signers([player1.payer])
            .rpc();
        console.log("Your transaction signature - create (again)", tx);
    });
    it("Is closed!",async()=>{
        const [game2] = PublicKey.findProgramAddressSync([
            Buffer.from("game_2","utf-8"),
            player1.publicKey.toBuffer()
        ],program.programId)
        const tx_succ1 = await program.methods.createGame("game_2")
            .accounts({
                game: game2,
                signer: player1.publicKey,
                systemProgram: SystemProgram.programId
            })
            .signers([player1.payer])
            .rpc();
        console.log("Your transaction signature - creation", tx_succ1);
        //closing not our game
        const tx_fail = await program.methods.closeGame("game_2")
            .accounts({
                game: game2,
                signer: player2.publicKey,
                systemProgram: SystemProgram.programId
            })
            .signers([player2.payer])
            .rpc().catch(()=>null);
        expect(tx_fail).to.be.null
        const tx = await program.methods.closeGame("game_2")
            .accounts({
                game: game2,
                signer: player1.publicKey
            })
            .signers([player1.payer])
            .rpc();
        console.log("Your transaction signature - deletion", tx);
    })
    it("Join Game!", async () => {

        // base cases cant join own game duh
        const tx_fail = await program.methods.joinGame("game_1")
            .accounts({
                game: gameBase,
                signer: player1.publicKey,
                gameOwner: player1.publicKey
            })
            .signers([player1.payer])
            .rpc().catch(() => null);
        expect(tx_fail).to.be.null
        // join a empty game
        const tx = await program.methods.joinGame("game_1")
            .accounts({
                game: gameBase,
                signer: player2.publicKey,
                gameOwner: player1.publicKey
            })
            .signers([player2.payer])
            .rpc().catch(() => null);
        expect(tx).to.not.eq(null)
        console.log("Your transaction signature - p2", tx);
        const tx_fail2 = await program.methods.joinGame("game_1")
            .accounts({
                game: gameBase,
                signer: player3.publicKey,
                gameOwner: player1.publicKey
            })
            .signers([player3.payer])
            .rpc().catch(() => null);
        expect(tx_fail2).to.be.null
        console.log("Your transaction signature - p3", tx_fail2);
    });
    it("Play Game!", async () => {

        // Playing someone else's game
        const tx_fail = await program.methods.play("game_1",[0,0])
            .accounts({
                game: gameBase,
                signer: player3.publicKey,
                gameOwner: player1.publicKey
            })
            .signers([player3.payer])
            .rpc().catch(() => null);
        expect(tx_fail).to.be.null
        // plays a move out of turn
        const tx_fail2 = await program.methods.play("game_1",[0,0])
            .accounts({
                game: gameBase,
                signer: player2.publicKey,
                gameOwner: player1.publicKey
            })
            .signers([player2.payer])
            .rpc().catch(() => null);
        expect(tx_fail2).to.be.null
        const inst = await program.methods.play("game_1",[0,0])
            .accounts({
                game: gameBase,
                signer: player1.publicKey,
                gameOwner: player1.publicKey
            }).instruction()
        const tx = await  sendAndConfirmTransaction(connection,new Transaction().add(inst),[player1.payer],{skipPreflight:true})
            // .signers([player1.payer])
            // .rpc()
        expect(tx).to.not.eq(null)
        console.log("Your transaction signature - p3", tx);
        // plays a slot that is taken
        const tx_fail3 = await program.methods.play("game_1",[0,0])
            .accounts({
                game: gameBase,
                signer: player2.publicKey,
                gameOwner: player1.publicKey
            })
            .signers([player2.payer])
            .rpc().catch(() => null);
        expect(tx_fail3).to.be.null
    });
    it("Win game! - ROW",async()=>{
        // based on previous tests 0,0 is taken by p1 and its p2's turn
        let tx = await program.methods.play("game_1",[1,0])
            .accounts({
                game: gameBase,
                signer: player2.publicKey,
                gameOwner: player1.publicKey
            }).signers([player2.payer]).rpc()
        expect(tx).to.not.eq(null)
        console.log("Your transaction signature - p2 (1,0)", tx);
        // p1 moving
         tx = await program.methods.play("game_1",[0,1])
            .accounts({
                game: gameBase,
                signer: player1.publicKey,
                gameOwner: player1.publicKey
            }).signers([player1.payer]).rpc()
        expect(tx).to.not.eq(null)
        console.log("Your transaction signature - p1 (0,1)", tx);
         // p2 moving
        tx = await program.methods.play("game_1",[2,0])
            .accounts({
                game: gameBase,
                signer: player2.publicKey,
                gameOwner: player1.publicKey
            }).signers([player2.payer]).rpc()
        expect(tx).to.not.eq(null)
        console.log("Your transaction signature - p2 (2,0)", tx);
        // p1 moving - game winning move
        tx = await program.methods.play("game_1",[0,2])
            .accounts({
                game: gameBase,
                signer: player1.publicKey,
                gameOwner: player1.publicKey
            }).signers([player1.payer]).rpc()
        expect(tx).to.not.eq(null)
        console.log("Your transaction signature - p1 (0,3)", tx);

        // game over cant move
        tx = await program.methods.play("game_1",[1,2])
            .accounts({
                game: gameBase,
                signer: player2.publicKey,
                gameOwner: player1.publicKey
            }).signers([player2.payer]).rpc().catch(()=>null)

        expect(tx).to.be.null
    })
    it("Game 2 -> Win! - Diag - TopL->BottomR", async()=>{
        const game2Buffer = Buffer.from("game_2","utf-8")
        const [game2] = PublicKey.findProgramAddressSync([
            game2Buffer,
            player1.publicKey.toBuffer()
        ],program.programId)
        let tx = await program.methods.createGame("game_2")
            .accounts({
                game:game2,
                signer:player1.publicKey,
                systemProgram:SystemProgram.programId
            })
            .signers([player1.payer])
            .rpc().catch(()=>null)
        expect(tx).to.not.eq(null)
        console.log("Game 2 creation: ",tx)
         tx = await program.methods.joinGame("game_2")
            .accounts({
                game:game2,
                signer:player2.publicKey,
                gameOwner:player1.publicKey
            })
            .signers([player2.payer])
            .rpc().catch(()=>null)
        console.log("Game 2 Join: ",tx)
        tx = await program.methods.play("game_2",[0,0])
            .accounts({
                game: game2,
                signer: player1.publicKey,
                gameOwner: player1.publicKey
            }).signers([player1.payer]).rpc()
        expect(tx).to.not.eq(null)
        console.log("Player move p1 (0,0) - ",tx)
        tx = await program.methods.play("game_2",[0,1])
            .accounts({
                game: game2,
                signer: player2.publicKey,
                gameOwner: player1.publicKey
            }).signers([player2.payer]).rpc()
        expect(tx).to.not.eq(null)
        console.log("Player move p2 (0,1)- ",tx)
        tx = await program.methods.play("game_2",[1,1])
            .accounts({
                game: game2,
                signer: player1.publicKey,
                gameOwner: player1.publicKey
            }).signers([player1.payer]).rpc()
        expect(tx).to.not.eq(null)
        console.log("Player move p1 (1,1)- ",tx)
        tx = await program.methods.play("game_2",[0,2])
            .accounts({
                game: game2,
                signer: player2.publicKey,
                gameOwner: player1.publicKey
            }).signers([player2.payer]).rpc()
        expect(tx).to.not.eq(null)
        console.log("Player move p2 (0,3) - ",tx)
        tx = await program.methods.play("game_2",[2,2])
            .accounts({
                game: game2,
                signer: player1.publicKey,
                gameOwner: player1.publicKey
            }).signers([player1.payer]).rpc()
        expect(tx).to.not.eq(null)
        console.log("Player move p1 (2,2) [WIN]- ",tx)
        tx = await program.methods.play("game_2",[1,0])
            .accounts({
                game: game2,
                signer: player2.publicKey,
                gameOwner: player1.publicKey
            }).signers([player2.payer]).rpc().catch(()=>null)
        expect(tx).to.be.null
        console.log("Player move p2 (1,0) [FAIL - GAME OVER]- ",tx)
    })
    it("Game 3 -> Win! - Diag - TopL->BottomR", async()=>{
        const game3Buffer = Buffer.from("game_3","utf-8")
        const [game3] = PublicKey.findProgramAddressSync([
            game3Buffer,
            player1.publicKey.toBuffer()
        ],program.programId)
        let tx = await program.methods.createGame("game_3")
            .accounts({
                game:game3,
                signer:player1.publicKey,
                systemProgram:SystemProgram.programId
            })
            .signers([player1.payer])
            .rpc().catch(()=>null)
        expect(tx).to.not.eq(null)
        console.log("Game 3 creation: ",tx)
        tx = await program.methods.joinGame("game_3")
            .accounts({
                game:game3,
                signer:player2.publicKey,
                gameOwner:player1.publicKey
            })
            .signers([player2.payer])
            .rpc().catch(()=>null)
        console.log("Game 3 Join: ",tx)
        tx = await program.methods.play("game_3",[0,2])
            .accounts({
                game: game3,
                signer: player1.publicKey,
                gameOwner: player1.publicKey
            }).signers([player1.payer]).rpc()
        expect(tx).to.not.eq(null)
        console.log("Player move p1 (0,2) - ",tx)
        tx = await program.methods.play("game_3",[0,1])
            .accounts({
                game: game3,
                signer: player2.publicKey,
                gameOwner: player1.publicKey
            }).signers([player2.payer]).rpc()
        expect(tx).to.not.eq(null)
        console.log("Player move p2 (0,1)- ",tx)
        tx = await program.methods.play("game_3",[1,1])
            .accounts({
                game: game3,
                signer: player1.publicKey,
                gameOwner: player1.publicKey
            }).signers([player1.payer]).rpc()
        expect(tx).to.not.eq(null)
        console.log("Player move p1 (1,1)- ",tx)
        tx = await program.methods.play("game_3",[0,0])
            .accounts({
                game: game3,
                signer: player2.publicKey,
                gameOwner: player1.publicKey
            }).signers([player2.payer]).rpc()
        expect(tx).to.not.eq(null)
        console.log("Player move p2 (0,0) - ",tx)
        tx = await program.methods.play("game_3",[2,0])
            .accounts({
                game: game3,
                signer: player1.publicKey,
                gameOwner: player1.publicKey
            }).signers([player1.payer]).rpc()
        expect(tx).to.not.eq(null)
        console.log("Player move p1 (2,0) [WIN]- ",tx)
        tx = await program.methods.play("game_3",[1,0])
            .accounts({
                game: game3,
                signer: player2.publicKey,
                gameOwner: player1.publicKey
            }).signers([player2.payer]).rpc().catch(()=>null)
        console.log("Player move p2 (1,0) [FAIL - GAME OVER]- ",tx)

        expect(tx).to.be.null
    })
    it("Game 4 -> Win! - Column", async()=>{
        const game4Buffer = Buffer.from("game_4","utf-8")
        const [game4] = PublicKey.findProgramAddressSync([
            game4Buffer,
            player1.publicKey.toBuffer()
        ],program.programId)
        let tx = await program.methods.createGame("game_4")
            .accounts({
                game:game4,
                signer:player1.publicKey,
                systemProgram:SystemProgram.programId
            })
            .signers([player1.payer])
            .rpc().catch(()=>null)
        expect(tx).to.not.eq(null)
        console.log("Game 4 creation: ",tx)
        tx = await program.methods.joinGame("game_4")
            .accounts({
                game:game4,
                signer:player2.publicKey,
                gameOwner:player1.publicKey
            })
            .signers([player2.payer])
            .rpc().catch(()=>null)
        console.log("Game 4 Join: ",tx)
        tx = await program.methods.play("game_4",[0,0])
            .accounts({
                game: game4,
                signer: player1.publicKey,
                gameOwner: player1.publicKey
            }).signers([player1.payer]).rpc()
        expect(tx).to.not.eq(null)
        console.log("Player move p1 (0,0) - ",tx)
        tx = await program.methods.play("game_4",[0,1])
            .accounts({
                game: game4,
                signer: player2.publicKey,
                gameOwner: player1.publicKey
            }).signers([player2.payer]).rpc()
        expect(tx).to.not.eq(null)
        console.log("Player move p2 (0,1)- ",tx)
        tx = await program.methods.play("game_4",[1,0])
            .accounts({
                game: game4,
                signer: player1.publicKey,
                gameOwner: player1.publicKey
            }).signers([player1.payer]).rpc()
        expect(tx).to.not.eq(null)
        console.log("Player move p1 (1,0)- ",tx)
        tx = await program.methods.play("game_4",[0,2])
            .accounts({
                game: game4,
                signer: player2.publicKey,
                gameOwner: player1.publicKey
            }).signers([player2.payer]).rpc()
        expect(tx).to.not.eq(null)
        console.log("Player move p2 (0,1) - ",tx)
        tx = await program.methods.play("game_4",[2,0])
            .accounts({
                game: game4,
                signer: player1.publicKey,
                gameOwner: player1.publicKey
            }).signers([player1.payer]).rpc()
        expect(tx).to.not.eq(null)
        console.log("Player move p1 (2,0) [WIN]- ",tx)
        tx = await program.methods.play("game_4",[1,1])
            .accounts({
                game: game4,
                signer: player2.publicKey,
                gameOwner: player1.publicKey
            }).signers([player2.payer]).rpc().catch(()=>null)
        console.log("Player move p2 (1,1) [FAIL - GAME OVER]- ",tx)

        expect(tx).to.be.null
    })

});

function createWallet(): [Wallet, Keypair] {
    const kp = Keypair.generate()
    return [new Wallet(kp), kp]
}

async function topUp(connection: Connection, wallet: Wallet, amount = 10) {
    const tx = await connection.requestAirdrop(wallet.publicKey, 10 * LAMPORTS_PER_SOL)
    await connection.confirmTransaction(tx)
}