import { type Tree, getPackageManagerCommand } from 'nx/src/devkit-exports';
import type { PackageManagerCommands } from 'nx/src/utils/package-manager';
import { findPluginForConfigFile } from '../utils/find-plugin-for-config-file';

interface E2EWebServerDefaultValues {
  defaultServeTargetName: string;
  defaultServeStaticTargetName: string;
  defaultE2EWebServerAddress: string;
  defaultE2ECiBaseUrl: string;
}

interface E2EWebServerPluginOptions {
  plugin: string;
  configFilePath: string;
  serveTargetName: string;
  serveStaticTargetName: string;
}

export interface E2EWebServerDetails {
  e2eWebServerAddress: string;
  e2eWebServerCommand: string;
  e2eCiWebServerCommand: string;
  e2eCiBaseUrl: string;
}

export async function getE2EWebServerInfo(
  tree: Tree,
  projectName: string,
  pluginOptions: E2EWebServerPluginOptions,
  defaultValues: E2EWebServerDefaultValues,
  isPluginBeingAdded: boolean
): Promise<E2EWebServerDetails> {
  const pm = getPackageManagerCommand();
  if (isPluginBeingAdded) {
    return await getE2EWebServerInfoForPlugin(
      tree,
      projectName,
      pluginOptions,
      defaultValues,
      pm
    );
  } else {
    return {
      e2eWebServerAddress: defaultValues.defaultE2EWebServerAddress,
      e2eWebServerCommand: `${pm.exec} nx run ${projectName}:${defaultValues.defaultServeTargetName}`,
      e2eCiWebServerCommand: `${pm.exec} nx run ${projectName}:${defaultValues.defaultServeStaticTargetName}`,
      e2eCiBaseUrl: defaultValues.defaultE2ECiBaseUrl,
    };
  }
}

async function getE2EWebServerInfoForPlugin(
  tree: Tree,
  projectName: string,
  pluginOptions: E2EWebServerPluginOptions,
  defaultValues: E2EWebServerDefaultValues,
  pm: PackageManagerCommands
): Promise<E2EWebServerDetails> {
  const foundPlugin = await findPluginForConfigFile(
    tree,
    pluginOptions.plugin,
    pluginOptions.configFilePath
  );
  if (
    !foundPlugin ||
    typeof foundPlugin === 'string' ||
    !foundPlugin?.options
  ) {
    return {
      e2eWebServerAddress: defaultValues.defaultE2EWebServerAddress,
      e2eWebServerCommand: `${pm.exec} nx run ${projectName}:${defaultValues.defaultServeTargetName}`,
      e2eCiWebServerCommand: `${pm.exec} nx run ${projectName}:${defaultValues.defaultServeStaticTargetName}`,
      e2eCiBaseUrl: defaultValues.defaultE2ECiBaseUrl,
    };
  }

  return {
    e2eWebServerAddress: defaultValues.defaultE2EWebServerAddress,
    e2eWebServerCommand: `${pm.exec} nx run ${projectName}:${
      foundPlugin.options[pluginOptions.serveTargetName] ??
      defaultValues.defaultServeTargetName
    }`,
    e2eCiWebServerCommand: `${pm.exec} nx run ${projectName}:${
      foundPlugin.options[pluginOptions.serveStaticTargetName] ??
      defaultValues.defaultServeStaticTargetName
    }`,
    e2eCiBaseUrl: defaultValues.defaultE2ECiBaseUrl,
  };
}
