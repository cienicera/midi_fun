export const contractAbi = [
    {
      "name": "HelloStarknetImpl",
      "type": "impl",
      "interface_name": "hello_cairo::IHelloStarknet"
    },
    {
      "name": "hello_cairo::IHelloStarknet",
      "type": "interface",
      "items": [
        {
          "name": "increase_balance",
          "type": "function",
          "inputs": [
            {
              "name": "amount",
              "type": "core::felt252"
            }
          ],
          "outputs": [],
          "state_mutability": "external"
        },
        {
          "name": "get_balance",
          "type": "function",
          "inputs": [],
          "outputs": [
            {
              "type": "core::felt252"
            }
          ],
          "state_mutability": "view"
        }
      ]
    },
    {
      "kind": "struct",
      "name": "hello_cairo::HelloStarknet::AudioParams",
      "type": "event",
      "members": [
        {
          "kind": "key",
          "name": "synthid",
          "type": "core::felt252"
        },
        {
          "kind": "data",
          "name": "value",
          "type": "core::felt252"
        }
      ]
    },
    {
      "kind": "enum",
      "name": "hello_cairo::HelloStarknet::Event",
      "type": "event",
      "variants": [
        {
          "kind": "nested",
          "name": "AudioParams",
          "type": "hello_cairo::HelloStarknet::AudioParams"
        }
      ]
    }
  ];