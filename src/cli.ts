#!/usr/bin/env node

import { Command } from 'commander';
import { OpenClawMem } from './index';
import path from 'path';
import os from 'os';

const program = new Command();

program
  .name('openclaw-mem')
  .description('OpenClaw Memory System')
  .version('0.1.0');

// init 指令
program
  .command('init')
  .description('Initialize OpenClaw-Mem')
  .action(async () => {
    try {
      const mem = new OpenClawMem();
      await mem.init();
      console.log('✅ OpenClaw-Mem initialized successfully');
    } catch (error) {
      console.error('❌ Initialization failed:', error);
      process.exit(1);
    }
  });

// import 指令
program
  .command('import')
  .description('Import memories from Markdown files')
  .option('-d, --dir <directory>', 'Memory directory', path.join(os.homedir(), '.openclaw/workspace/memory'))
  .action(async (options) => {
    try {
      const mem = new OpenClawMem({
        memoryDir: options.dir
      });
      await mem.init();
      const count = await mem.importMarkdown();
      console.log(`✅ Imported ${count} memories`);
      mem.close();
    } catch (error) {
      console.error('❌ Import failed:', error);
      process.exit(1);
    }
  });

// search 指令
program
  .command('search <query>')
  .description('Search memories')
  .option('-l, --limit <number>', 'Result limit', '10')
  .action(async (query, options) => {
    try {
      const mem = new OpenClawMem();
      await mem.init();
      
      const results = mem.search(query, parseInt(options.limit));
      
      if (results.length === 0) {
        console.log('No results found');
      } else {
        console.log(`Found ${results.length} results:\n`);
        
        results.forEach((result, index) => {
          console.log(`${index + 1}. [${result.date}] (score: ${result.score.toFixed(2)})`);
          console.log(`   ${result.snippet}`);
          console.log('');
        });
      }
      
      mem.close();
    } catch (error) {
      console.error('❌ Search failed:', error);
      process.exit(1);
    }
  });

// status 指令
program
  .command('status')
  .description('Show OpenClaw-Mem status')
  .action(async () => {
    try {
      const mem = new OpenClawMem();
      await mem.init();
      
      const stats = mem.getStats();
      
      console.log('OpenClaw-Mem Status:');
      console.log(`  Total Memories: ${stats.totalMemories}`);
      console.log(`  Database Size: ${(stats.dbSize / 1024).toFixed(2)} KB`);
      console.log(`  Database Path: ${stats.dbPath}`);
      
      mem.close();
    } catch (error) {
      console.error('❌ Failed to get status:', error);
      process.exit(1);
    }
  });

program.parse();
