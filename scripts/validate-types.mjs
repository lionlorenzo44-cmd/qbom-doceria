#!/usr/bin/env node

/**
 * Script de Validação de Tipos
 * Detecta automaticamente incompatibilidades entre tipos do schema e banco de dados
 * Previne erros como: string | null vs string | undefined
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');
const schemaPath = path.join(projectRoot, 'drizzle', 'schema.ts');

function validateSchema() {
  console.log('🔍 Validando tipos no schema...\n');
  
  if (!fs.existsSync(schemaPath)) {
    console.error(`❌ Schema não encontrado em: ${schemaPath}`);
    process.exit(1);
  }

  const schemaContent = fs.readFileSync(schemaPath, 'utf-8');
  const lines = schemaContent.split('\n');
  let hasErrors = false;
  const problematicFields = [];

  // Procurar por campos TEXT ou VARCHAR sem $type na mesma linha
  lines.forEach((line, idx) => {
    // Ignorar imports e comentários
    if (line.includes('import') || line.trim().startsWith('//') || line.trim().startsWith('*')) {
      return;
    }

    // Procura por varchar ou text que NÃO tem $type na mesma linha
    if ((line.includes('varchar(') || line.includes('text(')) && !line.includes('$type')) {
      const fieldMatch = line.match(/(?:varchar|text)\("([^"]+)"/);
      if (fieldMatch) {
        problematicFields.push({
          line: idx + 1,
          field: fieldMatch[1],
          type: line.includes('varchar') ? 'VARCHAR' : 'TEXT'
        });
      }
    }

    // Procurar por string | undefined (banco retorna null, não undefined)
    if (line.includes('$type<string | undefined>')) {
      const fieldMatch = line.match(/(\w+):\s*(?:varchar|text)/);
      if (fieldMatch) {
        problematicFields.push({
          line: idx + 1,
          field: fieldMatch[1],
          issue: 'string | undefined (banco retorna null)',
          type: 'TYPE_MISMATCH'
        });
      }
    }
  });

  if (problematicFields.length > 0) {
    hasErrors = true;
    problematicFields.forEach(({ line, field, type, issue }) => {
      if (issue) {
        console.log(`⚠️  Campo com tipo ${issue}`);
      } else {
        console.log(`⚠️  Campo ${type} sem tipo explícito (pode ser null | undefined)`);
      }
      console.log(`   Campo: ${field}`);
      console.log(`   Linha: ${line}`);
      console.log(`   Sugestão: Adicione .$type<string | null>()\n`);
    });
  }

  if (!hasErrors) {
    console.log('✅ Nenhum erro de tipo detectado!\n');
    return true;
  }

  console.log('❌ Erros de tipo encontrados. Execute: npm run fix-types\n');
  return false;
}

function fixTypes() {
  console.log('🔧 Corrigindo tipos automaticamente...\n');
  
  let schemaContent = fs.readFileSync(schemaPath, 'utf-8');
  const lines = schemaContent.split('\n');
  let fixed = false;

  // Corrigir tipos undefined para null
  const beforeUndefined = schemaContent;
  schemaContent = schemaContent.replace(/\$type<string \| undefined>\(\)/g, '.$type<string | null>()');
  if (beforeUndefined !== schemaContent) {
    console.log('✅ Corrigido: string | undefined → string | null');
    fixed = true;
  }

  // Adicionar tipos explícitos onde faltam
  const fixedLines = schemaContent.split('\n').map((line, idx) => {
    // Ignorar imports e comentários
    if (line.includes('import') || line.trim().startsWith('//') || line.trim().startsWith('*')) {
      return line;
    }

    // Se tem varchar ou text sem $type, adicionar tipo
    if ((line.includes('varchar(') || line.includes('text(')) && !line.includes('$type')) {
      // Encontrar a posição do ) que fecha varchar ou text
      const varcharMatch = line.match(/varchar\("([^"]+)"[^)]*\)/);
      const textMatch = line.match(/text\("([^"]+)"\)/);
      
      if (varcharMatch) {
        const closeParenIndex = line.indexOf(varcharMatch[0]) + varcharMatch[0].length;
        const before = line.substring(0, closeParenIndex);
        const after = line.substring(closeParenIndex);
        const newLine = before + '.$type<string | null>()' + after;
        fixed = true;
        return newLine;
      } else if (textMatch) {
        const closeParenIndex = line.indexOf(textMatch[0]) + textMatch[0].length;
        const before = line.substring(0, closeParenIndex);
        const after = line.substring(closeParenIndex);
        const newLine = before + '.$type<string | null>()' + after;
        fixed = true;
        return newLine;
      }
    }

    return line;
  });

  if (fixed) {
    schemaContent = fixedLines.join('\n');
    fs.writeFileSync(schemaPath, schemaContent);
    console.log('\n✅ Schema atualizado com sucesso!');
    console.log('⚠️  Execute: pnpm drizzle-kit generate\n');
    return true;
  }

  console.log('ℹ️  Nenhuma correção necessária\n');
  return false;
}

// Executar validação ou correção
const command = process.argv[2];

if (command === '--fix') {
  fixTypes();
} else {
  const isValid = validateSchema();
  process.exit(isValid ? 0 : 1);
}
