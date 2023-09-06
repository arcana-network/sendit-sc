import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;

  const { deployer } = await getNamedAccounts();

  let snt = await deploy('Sendit', {
    contract: 'Sendit',
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
  console.log('==sendit impl=', snt.implementation)

 const tkn = await deploy('Token', {
    contract: 'Token',
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