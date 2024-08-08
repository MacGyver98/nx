import { verifyOrUpdateNxCloudClient } from '../../nx-cloud/update-manager';
import { Argv, CommandModule } from 'yargs';
import { handleErrors } from '../../utils/params';
import { nxVersion } from '../../utils/versions';
import { getCloudOptions } from '../../nx-cloud/utilities/get-cloud-options';

export const yargsLoginCommand: CommandModule = {
  command: 'login',
  describe: 'Login to Nx Cloud',
  builder: (yargs) => withLoginOptions(yargs),
  handler: async (args) => {
    args._ = args._.slice(1);
    const exitCode = await handleErrors(
      (args.verbose as boolean) ?? process.env.NX_VERBOSE_LOGGING === 'true',
      async () => {
        const nxCloudClient = (
          await verifyOrUpdateNxCloudClient(getCloudOptions())
        ).nxCloudClient;
        await nxCloudClient.commands.login();
      }
    );
    await (
      await import('../../utils/ab-testing')
    ).recordStat({
      command: 'login',
      nxVersion,
      useCloud: true,
    });
    process.exit(exitCode);
  },
};

function withLoginOptions(yargs: Argv) {
  const loginWillShowHelp = process.argv[3] && !process.argv[3].startsWith('-');
  const res = yargs.positional('nxCloudUrl', {
    describe: 'The Nx Cloud URL of the instance you are trying to connect to.',
    type: 'string',
    required: false,
  });

  if (loginWillShowHelp) {
    return res.help(false);
  } else {
    return res.epilog(
      `Run "nx login --help" to see information about this command`
    );
  }
}
