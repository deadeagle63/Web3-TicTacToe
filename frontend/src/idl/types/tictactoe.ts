export type Tictactoe = {
  "version": "0.1.0",
  "name": "tictactoe",
  "instructions": [
    {
      "name": "createGame",
      "accounts": [
        {
          "name": "game",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "gameId",
          "type": "string"
        }
      ]
    },
    {
      "name": "joinGame",
      "accounts": [
        {
          "name": "game",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "gameOwner",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "CHECKED: This is the person who set the game up's pubkey"
          ]
        },
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "gameId",
          "type": "string"
        }
      ]
    },
    {
      "name": "leaveGame",
      "accounts": [
        {
          "name": "game",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "gameOwner",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "CHECKED: This is the person who set the game up's pubkey"
          ]
        },
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "gameId",
          "type": "string"
        }
      ]
    },
    {
      "name": "play",
      "accounts": [
        {
          "name": "game",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "gameOwner",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "CHECKED: This is the person who set the game up's pubkey"
          ]
        }
      ],
      "args": [
        {
          "name": "gameId",
          "type": "string"
        },
        {
          "name": "gameMove",
          "type": {
            "array": [
              "u8",
              2
            ]
          }
        }
      ]
    },
    {
      "name": "closeGame",
      "accounts": [
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "game",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "gameId",
          "type": "string"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "game",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "player2",
            "type": "publicKey"
          },
          {
            "name": "winner",
            "type": "publicKey"
          },
          {
            "name": "board",
            "type": {
              "array": [
                {
                  "array": [
                    {
                      "defined": "GameSign"
                    },
                    3
                  ]
                },
                3
              ]
            }
          },
          {
            "name": "authorityTurn",
            "type": "bool"
          },
          {
            "name": "over",
            "type": "bool"
          },
          {
            "name": "gameId",
            "type": "string"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "GameSign",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "None"
          },
          {
            "name": "X"
          },
          {
            "name": "O"
          }
        ]
      }
    }
  ],
  "events": [
    {
      "name": "GameOver",
      "fields": [
        {
          "name": "winner",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "gameId",
          "type": "string",
          "index": false
        }
      ]
    },
    {
      "name": "GameState",
      "fields": [
        {
          "name": "board",
          "type": {
            "array": [
              {
                "array": [
                  {
                    "defined": "GameSign"
                  },
                  3
                ]
              },
              3
            ]
          },
          "index": false
        },
        {
          "name": "authorityTurn",
          "type": "bool",
          "index": false
        },
        {
          "name": "gameId",
          "type": "string",
          "index": false
        }
      ]
    },
    {
      "name": "GameClosed",
      "fields": [
        {
          "name": "gameId",
          "type": "string",
          "index": false
        }
      ]
    },
    {
      "name": "GameJoined",
      "fields": [
        {
          "name": "player2",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "authority",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "gameId",
          "type": "string",
          "index": false
        }
      ]
    },
    {
      "name": "GameLeft",
      "fields": [
        {
          "name": "gameId",
          "type": "string",
          "index": false
        },
        {
          "name": "board",
          "type": {
            "array": [
              {
                "array": [
                  {
                    "defined": "GameSign"
                  },
                  3
                ]
              },
              3
            ]
          },
          "index": false
        }
      ]
    },
    {
      "name": "GameCreated",
      "fields": [
        {
          "name": "authority",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "player2",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "board",
          "type": {
            "array": [
              {
                "array": [
                  {
                    "defined": "GameSign"
                  },
                  3
                ]
              },
              3
            ]
          },
          "index": false
        },
        {
          "name": "gameId",
          "type": "string",
          "index": false
        }
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "NotPartOfTheGame",
      "msg": "You are not playing in this game"
    },
    {
      "code": 6001,
      "name": "NotEnoughPlayers",
      "msg": "Player 2 hasn't joined yet!"
    },
    {
      "code": 6002,
      "name": "NotYourTurn",
      "msg": "Not your turn yet"
    },
    {
      "code": 6003,
      "name": "SlotTaken",
      "msg": "Those slot is already taken"
    },
    {
      "code": 6004,
      "name": "YouWon",
      "msg": "You won!"
    },
    {
      "code": 6005,
      "name": "YouLost",
      "msg": "You Lost!"
    },
    {
      "code": 6006,
      "name": "GameAlreadyWon",
      "msg": "Game is over!"
    }
  ]
};

export const IDL: Tictactoe = {
  "version": "0.1.0",
  "name": "tictactoe",
  "instructions": [
    {
      "name": "createGame",
      "accounts": [
        {
          "name": "game",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "gameId",
          "type": "string"
        }
      ]
    },
    {
      "name": "joinGame",
      "accounts": [
        {
          "name": "game",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "gameOwner",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "CHECKED: This is the person who set the game up's pubkey"
          ]
        },
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "gameId",
          "type": "string"
        }
      ]
    },
    {
      "name": "leaveGame",
      "accounts": [
        {
          "name": "game",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "gameOwner",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "CHECKED: This is the person who set the game up's pubkey"
          ]
        },
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "gameId",
          "type": "string"
        }
      ]
    },
    {
      "name": "play",
      "accounts": [
        {
          "name": "game",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "gameOwner",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "CHECKED: This is the person who set the game up's pubkey"
          ]
        }
      ],
      "args": [
        {
          "name": "gameId",
          "type": "string"
        },
        {
          "name": "gameMove",
          "type": {
            "array": [
              "u8",
              2
            ]
          }
        }
      ]
    },
    {
      "name": "closeGame",
      "accounts": [
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "game",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "gameId",
          "type": "string"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "game",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "player2",
            "type": "publicKey"
          },
          {
            "name": "winner",
            "type": "publicKey"
          },
          {
            "name": "board",
            "type": {
              "array": [
                {
                  "array": [
                    {
                      "defined": "GameSign"
                    },
                    3
                  ]
                },
                3
              ]
            }
          },
          {
            "name": "authorityTurn",
            "type": "bool"
          },
          {
            "name": "over",
            "type": "bool"
          },
          {
            "name": "gameId",
            "type": "string"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "GameSign",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "None"
          },
          {
            "name": "X"
          },
          {
            "name": "O"
          }
        ]
      }
    }
  ],
  "events": [
    {
      "name": "GameOver",
      "fields": [
        {
          "name": "winner",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "gameId",
          "type": "string",
          "index": false
        }
      ]
    },
    {
      "name": "GameState",
      "fields": [
        {
          "name": "board",
          "type": {
            "array": [
              {
                "array": [
                  {
                    "defined": "GameSign"
                  },
                  3
                ]
              },
              3
            ]
          },
          "index": false
        },
        {
          "name": "authorityTurn",
          "type": "bool",
          "index": false
        },
        {
          "name": "gameId",
          "type": "string",
          "index": false
        }
      ]
    },
    {
      "name": "GameClosed",
      "fields": [
        {
          "name": "gameId",
          "type": "string",
          "index": false
        }
      ]
    },
    {
      "name": "GameJoined",
      "fields": [
        {
          "name": "player2",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "authority",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "gameId",
          "type": "string",
          "index": false
        }
      ]
    },
    {
      "name": "GameLeft",
      "fields": [
        {
          "name": "gameId",
          "type": "string",
          "index": false
        },
        {
          "name": "board",
          "type": {
            "array": [
              {
                "array": [
                  {
                    "defined": "GameSign"
                  },
                  3
                ]
              },
              3
            ]
          },
          "index": false
        }
      ]
    },
    {
      "name": "GameCreated",
      "fields": [
        {
          "name": "authority",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "player2",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "board",
          "type": {
            "array": [
              {
                "array": [
                  {
                    "defined": "GameSign"
                  },
                  3
                ]
              },
              3
            ]
          },
          "index": false
        },
        {
          "name": "gameId",
          "type": "string",
          "index": false
        }
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "NotPartOfTheGame",
      "msg": "You are not playing in this game"
    },
    {
      "code": 6001,
      "name": "NotEnoughPlayers",
      "msg": "Player 2 hasn't joined yet!"
    },
    {
      "code": 6002,
      "name": "NotYourTurn",
      "msg": "Not your turn yet"
    },
    {
      "code": 6003,
      "name": "SlotTaken",
      "msg": "Those slot is already taken"
    },
    {
      "code": 6004,
      "name": "YouWon",
      "msg": "You won!"
    },
    {
      "code": 6005,
      "name": "YouLost",
      "msg": "You Lost!"
    },
    {
      "code": 6006,
      "name": "GameAlreadyWon",
      "msg": "Game is over!"
    }
  ]
};
