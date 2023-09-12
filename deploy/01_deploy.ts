import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { Create2Factory } from '../scripts/create2Factory';
import { ethers } from 'hardhat'

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;

  const { deployer } = await getNamedAccounts();

  // await new Create2Factory(ethers.provider).deployFactory()

  let snt = await deploy('Sendit', {
    contract: 'Sendit',
    // deterministicDeployment: true,
    deterministicDeployment: {
      factory: "0x4e59b44847b379578588920ca78fbf26c0b4956c",
      deployer: "0x3fab184622dc19b6109349b94811493bf2a45362",
      funding: "0",
      signedTx: "0xf8a58085174876e800830186a08080b853604580600e600039806000f350fe7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe03601600081602082378035828234f58015156039578182fd5b8082525050506014600cf31ba02222222222222222222222222222222222222222222222222222222222222222a02222222222222222222222222222222222222222222222222222222222222222",
    },
    from: deployer,
    proxy: {
      owner: deployer,
      proxyContract: 'OpenZeppelinTransparentProxy',
      execute: {
        init: {
          methodName: 'initialize',
        }
      }
    },
    log: false,
  });

  console.log('==sendit addr=', snt.address)

 const tkn = await deploy('Token', {
    contract: 'Token',
    deterministicDeployment: true,
    from: deployer,
    proxy: {
      owner: deployer,
      proxyContract: 'OpenZeppelinTransparentProxy',
      execute: {
        init: {
          methodName: 'initialize',
        }
      }
    },
    log: false,
  });

  console.log('==token addr=', tkn.address)

};
export default func;
func.tags = ['Sendit'];