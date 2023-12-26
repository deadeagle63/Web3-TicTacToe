# Intro
This is a little Web3 project which is a simple TicTacToe game. 

## Program

### Testing
You can easily test the program by running :
```sh
anchor build && anchor test --detach
```
### Localnet deployment
To deploy to Localnet and use it with the FE there are 2 steps:
*NOTE* Ensure Localnet is up by running `solana-test-validator`
```sh
anchor build && anchor deploy --provider.cluster http://localnet:8899
```
Afterwards to see a nice IDL on Solana Explorer you need to deploy the IDL you can do this by:

```sh
anchor idl init --filepath target/idl/tictactoe.json <programId> --provider.cluster http://localhost:8899 --provider.wallet <your keypair path>
```

### Localnet Upgrading
If you make any changes and are just testing to see functionality you may want to upgrade instead of redeploying if the contract doesn't feature any breaking changes.
To do so, run the following steps:
```sh
anchor build && anchor upgrade --program-id <program id> --provider.cluster http://localnet:8899
```
And to update the IDL run the following..
```sh
anchor idl upgrade --filepath target/idl/tictactoe.json <programId> --provider.cluster http://localhost:8899 --provider.wallet <your keypair path>
```


## FAQ
1.  Q: I am getting a funds problem, what could be the cause?
    A: You mostlikely need to run `solana airdrop <amount> <pubkey>` to get some funds on localnet
2.  Q: How can I reset the validator?
    A: Run `solana-test-validator -r` it starts up under a clean slate
3.  Q: The airdrop isn't targetting localnet, how can I target localnet?
    A: Run `solana config set -u l -k <keypair path> --commitment processed` this will set your validator to target localnet :)
4.  Q:How can I test this?
    A: Look in the frontend folder!
