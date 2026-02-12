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

// Padrões de tipos problemáticos
const TYPE_PATTERNS = [
  {
    pattern: /text\("([^"]+)"\)(?!.*\$type)/g,
    issue: 'Campo TEXT sem tipo explícito (pode ser null | undefined)',
    suggestion: 'Adicione .$type<string | null>()'
  },
  {
    pattern: /varchar\("([^"]+)".*?\)(?!.*\$type)/g,
    issue: 'Campo VARCHAR sem tipo explícito (pode ser null | undefined)',
    suggestion: 'Adicione .$type<string | null>()'
  },
  {
    pattern: /\$type<string \| undefined>\(\)/g,
    issue: 'Campo com tipo undefined (banco retorna null)',
    suggestion: 'Use .$type<string | null>() ao invés'
  }
];

// Tipos que devem ser iguais entre schema e inferência
const REQUIRED_TYPE_CONSISTENCY = [
  { field: 'url', expectedType: 'string | null' },
  { field: 'ipAddress', expectedType: 'string | null' },
  { field: 'userAgent', expectedType: 'string | null' },
  { field: 'errorStack', expectedType: 'string | null' }
];

function validateSchema() {
  console.log('🔍 Validando tipos no schema...\n');
  
  if (!fs.existsSync(schemaPath)) {
    console.error(`❌ Schema não encontrado em: ${schemaPath}`);
    process.exit(1);
  }

  const schemaContent = fs.readFileSync(schemaPath, 'utf-8');
  let hasErrors = false;

  // Verificar cada padrão
  TYPE_PATTERNS.forEach(({ pattern, issue, suggestion }) => {
    const matches = [...schemaContent.matchAll(pattern)];
    if (matches.length > 0) {
      hasErrors = true;
      console.log(`⚠️  ${issue}`);
      matches.forEach(match => {
        console.log(`   Campo: ${match[1] || match[0]}`);
        console.log(`   Sugestão: ${suggestion}\n`);
      });
    }
  });

  // Verificar consistência de tipos
  REQUIRED_TYPE_CONSISTENCY.forEach(({ field, expectedType }) => {
    const fieldRegex = new RegExp(`${field}:.*?\\$type<([^>]+)>`, 's');
    const match = schemaContent.match(fieldRegex);
    
    if (match && match[1] !== expectedType) {
      hasErrors = true;
      console.log(`⚠️  Campo '${field}' tem tipo inconsistente`);
      console.log(`   Esperado: ${expectedType}`);
      console.log(`   Encontrado: ${match[1]}\n`);
    }
  });

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
  let fixed = false;

  // Corrigir tipos undefined para null
  const beforeUndefined = schemaContent;
  schemaContent = schemaContent.replace(/\$type<string \| undefined>\(\)/g, '.$type<string | null>()');
  if (beforeUndefined !== schemaContent) {
    console.log('✅ Corrigido: string | undefined → string | null');
    fixed = true;
  }

  // Adicionar tipos explícitos onde faltam
  REQUIRED_TYPE_CONSISTENCY.forEach(({ field, expectedType }) => {
    const fieldRegex = new RegExp(`(${field}: text\\("${field}"\\))(?!.*\\$type)`, 'g');
    const beforeFix = schemaContent;
    schemaContent = schemaContent.replace(fieldRegex, `$1.$type<${expectedType}>()`);
    
    if (beforeFix !== schemaContent) {
      console.log(`✅ Adicionado tipo explícito para '${field}': ${expectedType}`);
      fixed = true;
    }
  });

  if (fixed) {
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
