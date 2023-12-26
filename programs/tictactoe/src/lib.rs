use anchor_lang::prelude::*;

declare_id!("EqkbdxDJU4sc4LAvDykEagPZ51VTnNZAp5rcHYgo3tde");

#[program]
pub mod tictactoe {
    use super::*;

    pub fn create_game(ctx: Context<CreateGame>, _game_id: String) -> Result<()> {
        let game = &mut ctx.accounts.game;
        game.authority = ctx.accounts.signer.key.clone();
        game.authority_turn = true;
        game.over = false;
        game.game_id = _game_id.clone();
        emit!(GameCreated{
            authority:game.authority.clone(),
            player2:game.player2.clone(),
            board:game.board.clone(),
            game_id:_game_id.clone(),
        });
        Ok(())
    }

    pub fn join_game(ctx: Context<JoinGame>, _game_id: String) -> Result<()> {
        let game = &mut ctx.accounts.game;
        if game.player2 != Pubkey::default() {
            return err!(GameErrors::NotPartOfTheGame);
        }
        if game.winner != Pubkey::default() {
            msg!("{} already won",game.winner.to_string());
            return err!(GameErrors::GameAlreadyWon);
        }
        game.player2 = ctx.accounts.signer.key().clone();
        emit!(GameJoined{
            authority:game.authority.clone(),
            player2:game.player2.clone(),
           game_id: _game_id.clone()
        });
        Ok(())
    }

    pub fn leave_game(ctx: Context<LeaveGame>, _game_id: String) -> Result<()> {
        let signer = &mut ctx.accounts.signer;
        let game = &mut ctx.accounts.game;
        let should_close = game.leave(&signer);
        if should_close {
            game.close(signer.to_account_info())?;
            emit! {GameClosed{
                   game_id: _game_id.clone()
            }}
        } else {
            emit!(GameLeft{
               game_id: _game_id.clone(),
                board: game.board.clone()
            })
        }
        Ok(())
    }

    pub fn play(ctx: Context<PlayGame>, _game_id: String, game_move: [u8; 2]) -> Result<()> {
        let signer = &mut ctx.accounts.signer;
        let game = &mut ctx.accounts.game;
        if game.winner != Pubkey::default() {
            msg!("{} already won",game.winner.to_string());
            return err!(GameErrors::GameAlreadyWon);
        }
        if game.player2 == Pubkey::default() {
            return err!(GameErrors::NotEnoughPlayers);
        }
        if signer.key() != game.authority && signer.key() != game.player2 {
            return err!(GameErrors::NotPartOfTheGame);
        }
        if game.authority_turn && signer.key() != game.authority {
            return err!(GameErrors::NotYourTurn);
        }
        let [x, y] = game_move;

        if game.board[x as usize][y as usize] != GameSign::None {
            return err!(GameErrors::SlotTaken);
        }
        let designated_sign = match game.authority_turn {
            true => GameSign::X,
            _ => GameSign::O
        };
        game.board[x as usize][y as usize] = designated_sign.clone();

        game.authority_turn = !game.authority_turn;
        emit!(GameState{
            board:game.board.clone(),
            authority_turn:game.authority_turn.clone(),
            game_id: _game_id.clone()
        });
        let over = game.check_win(x as usize, y as usize, designated_sign);
        game.over = over.clone();
        if over {
            game.winner = ctx.accounts.signer.key();
            emit!(GameOver{
                winner:ctx.accounts.signer.key(),
                game_id: _game_id.clone()
            })
        }
        Ok(())
    }

    pub fn close_game(_ctx: Context<CloseGame>, _game_id: String) -> Result<()> {
        emit!(GameClosed{
           game_id: _game_id.clone()
        });
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(game_id: String)]
pub struct CreateGame<'info> {
    #[account(init, payer = signer, seeds = [game_id.as_bytes().as_ref(), signer.key().as_ref()], bump, space = 8 + Game::INIT_SPACE)]
    game: Account<'info, Game>,
    #[account(mut)]
    signer: Signer<'info>,
    system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(game_id: String, game_move: [u8; 2])]
pub struct PlayGame<'info> {
    #[account(mut, seeds = [game_id.as_bytes().as_ref(), game_owner.key().as_ref()], bump, constraint = game.authority == signer.key() || game.player2 == signer.key())]
    game: Account<'info, Game>,
    #[account(mut)]
    signer: Signer<'info>,
    /// CHECKED: This is the person who set the game up's pubkey
    game_owner: UncheckedAccount<'info>,
}

#[derive(Accounts)]
#[instruction(game_id: String)]
pub struct JoinGame<'info> {
    #[account(mut, seeds = [game_id.as_bytes().as_ref(), game_owner.key().as_ref()], bump, constraint = game.authority != signer.key())]
    game: Account<'info, Game>,
    /// CHECKED: This is the person who set the game up's pubkey
    game_owner: UncheckedAccount<'info>,
    #[account(mut)]
    signer: Signer<'info>,
}

#[derive(Accounts)]
#[instruction(game_id: String)]
pub struct LeaveGame<'info> {
    #[account(mut, seeds = [game_id.as_bytes().as_ref(), game_owner.key().as_ref()], bump, constraint = game.authority == signer.key() || game.player2 == signer.key())]
    game: Account<'info, Game>,
    /// CHECKED: This is the person who set the game up's pubkey
    game_owner: UncheckedAccount<'info>,
    #[account(mut)]
    signer: Signer<'info>,
    system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(game_id: String)]
pub struct CloseGame<'info> {
    #[account(mut)]
    signer: Signer<'info>,
    #[account(mut, seeds = [game_id.as_bytes().as_ref(), signer.key().as_ref()], bump, constraint = game.authority == signer.key(), close = signer)]
    game: Account<'info, Game>,
}

#[account]
#[derive(InitSpace)]
pub struct Game {
    authority: Pubkey,
    player2: Pubkey,
    winner: Pubkey,
    board: [[GameSign; 3]; 3],
    authority_turn: bool,
    over:bool,
    #[max_len(200)]
    game_id: String,
}

impl Game {
    pub fn check_win(&self, x: usize, y: usize, sign: GameSign) -> bool {
        let mut count_row = 0;
        let mut count_col = 0;
        for i in 0..self.board.len() {
            if self.board[i][y] == sign { // ltr
                count_row += 1;
            }
            if self.board[x][i] == sign { // ttb
                count_col += 1;
            }
        }
        if count_row == 3 || count_col == 3 {
            return true;
        }
        let draw = self.board.iter().filter(|&&row|row.iter().filter(|&&col|col!=GameSign::None).collect::<Vec<_>>().len()==3).collect::<Vec<_>>().len()==3;
        return draw || ((self.board[0][0] == sign) &&
            (self.board[1][1] == sign) &&
            (self.board[2][2] == sign)) // diag top l -> bottom r
            || (
            (self.board[0][2] == sign) && // top r -> bottom -l
                (self.board[1][1] == sign) &&
                (self.board[2][0] == sign));
    }
    pub fn leave(&mut self, signer: &Signer) -> bool {
        if signer.key() == self.authority {
            return true;
        }
        self.board = Default::default();
        self.player2 = Default::default();
        self.winner = Default::default();
        self.authority_turn = true;
        self.over = false;
        return false;
    }
}

#[derive(Default, Copy, Clone, AnchorDeserialize, AnchorSerialize, Eq, PartialEq, InitSpace)]
pub enum GameSign {
    #[default]
    None,
    X,
    O,
}

#[error_code]
pub enum GameErrors {
    #[msg("You are not playing in this game")]
    NotPartOfTheGame,
    #[msg("Player 2 hasn't joined yet!")]
    NotEnoughPlayers,
    #[msg("Not your turn yet")]
    NotYourTurn,
    #[msg("Those slot is already taken")]
    SlotTaken,
    #[msg("You won!")]
    YouWon,
    #[msg("You Lost!")]
    YouLost,
    #[msg("Game is over!")]
    GameAlreadyWon,
}

#[event]
#[derive(Default)]
pub struct GameOver {
    winner: Pubkey,
    game_id: String,
}

#[event]
#[derive(Default)]
pub struct GameState {
    board: [[GameSign; 3]; 3],
    authority_turn: bool,
    game_id: String,
}

#[event]
pub struct GameClosed {
    game_id: String,
}

#[event]
pub struct GameJoined {
    player2: Pubkey,
    authority: Pubkey,
    game_id: String,
}
#[event]
pub struct GameLeft {
    game_id:String,
    board:[[GameSign;3];3]
}
#[event]
pub struct GameCreated {
    authority: Pubkey,
    player2: Pubkey,
    board: [[GameSign; 3]; 3],
    game_id: String,
}