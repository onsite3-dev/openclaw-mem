"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addConfigCommands = addConfigCommands;
const config_1 = require("./config");
function addConfigCommands(program) {
    // config 指令群組
    const configCmd = program
        .command('config')
        .description('Manage OpenClaw-Mem configuration');
    // config show - 顯示配置
    configCmd
        .command('show')
        .description('Show current configuration')
        .action(() => {
        try {
            const manager = new config_1.ConfigManager();
            const config = manager.load();
            console.log('OpenClaw-Mem Configuration:\n');
            console.log(JSON.stringify(config, null, 2));
        }
        catch (error) {
            console.error('❌ Failed to show config:', error);
            process.exit(1);
        }
    });
    // config set - 設定值
    configCmd
        .command('set <key> <value>')
        .description('Set configuration value')
        .action((key, value) => {
        try {
            const manager = new config_1.ConfigManager();
            const config = manager.load();
            // 解析路徑
            const keys = key.split('.');
            let target = config;
            for (let i = 0; i < keys.length - 1; i++) {
                if (!target[keys[i]]) {
                    target[keys[i]] = {};
                }
                target = target[keys[i]];
            }
            // 設定值（自動轉型）
            const lastKey = keys[keys.length - 1];
            if (value === 'true')
                target[lastKey] = true;
            else if (value === 'false')
                target[lastKey] = false;
            else if (!isNaN(Number(value)))
                target[lastKey] = Number(value);
            else
                target[lastKey] = value;
            manager.save(config);
            console.log(`✅ Set ${key} = ${value}`);
        }
        catch (error) {
            console.error('❌ Failed to set config:', error);
            process.exit(1);
        }
    });
    // config reset - 重設為預設值
    configCmd
        .command('reset')
        .description('Reset configuration to defaults')
        .action(() => {
        try {
            const manager = new config_1.ConfigManager();
            manager.reset();
            console.log('✅ Configuration reset to defaults');
        }
        catch (error) {
            console.error('❌ Failed to reset config:', error);
            process.exit(1);
        }
    });
    // config init - 建立預設配置檔
    configCmd
        .command('init')
        .description('Initialize configuration file')
        .action(() => {
        try {
            const manager = new config_1.ConfigManager();
            if (manager.exists()) {
                console.log('⚠️  Configuration file already exists');
                console.log('   Use "config reset" to reset to defaults');
            }
            else {
                manager.save({});
                console.log('✅ Configuration file created');
                console.log('   Location: ~/.openclaw/openclaw-mem.json');
            }
        }
        catch (error) {
            console.error('❌ Failed to initialize config:', error);
            process.exit(1);
        }
    });
}
//# sourceMappingURL=config-cli-commands.js.map