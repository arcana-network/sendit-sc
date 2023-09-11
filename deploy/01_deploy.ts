import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { Create2Factory } from '../scripts/create2Factory';
import { ethers } from 'hardhat'

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;

  const { deployer } = await getNamedAccounts();

  await new Create2Factory(ethers.provider).deployFactory()

  let snt = await deploy('Sendit', {
    contract: 'Sendit',
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