import ControllerConnector from "@cartridge/connector";

const contractAddress = "0x05a7ee0a287951464bcdfaa8c25194714f458106a0af16339723ce0a2ab36fad";
const sepoliaAddress = "0x07d08c25f35091012463841369755f0547bc3f3d9fb72df0112ae6461ef75073";
 
const connector  = new ControllerConnector({
    policies: [
            {
              target: sepoliaAddress,
              method: "increase_balance",
              description: "Allows incrementing the counter",
            },
            {
              target: sepoliaAddress,
              method: "get_balance",
              description: "Allows getting the value of the counter",
            },
    ],
    rpc: "https://api.cartridge.gg/x/starknet/sepolia",
    // Uncomment to use a custom theme
    theme: "pistols",
    colorMode: "dark",
});

export default connector;