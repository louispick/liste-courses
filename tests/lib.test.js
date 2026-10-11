import { test } from 'node:test';
import assert from 'node:assert/strict';
import { findCategory } from '../src/lib/categories.js';
import { parseInput, parseMany, formatQuantity, itemToText } from '../src/lib/parser.js';
import { findDuplicate } from '../src/lib/duplicates.js';
import { QUESTIONS } from '../src/lib/questions.js';

test('catégories : cas qui étaient faux avant', () => {
  const expected = {
    'Pâtes': 'Épicerie', 'Pâté de campagne': 'Viandes & Poissons', 'Menthe': 'Fruits & Légumes',
    'Jus de pomme': 'Boissons', 'Compote de pomme': 'Épicerie', 'Pommes de terre': 'Fruits & Légumes',
    'Eau de javel': 'Hygiène & Maison', 'Lait de coco': 'Épicerie', 'Lait bébé': 'Bébé',
    'Haricots verts': 'Fruits & Légumes', 'Haricots rouges': 'Épicerie', 'Thon en boite': 'Épicerie',
    'Pizza surgelée': 'Surgelés', 'Glace vanille': 'Surgelés', 'Pain de mie': 'Boulangerie',
    'Œufs': 'Frais & Crèmerie', 'Coca': 'Boissons', 'Papier alu': 'Hygiène & Maison',
    'Croquettes chat': 'Animaux', 'Tomates pelées': 'Épicerie', 'Boeuf haché': 'Viandes & Poissons',
    'Pot de yaourt': 'Frais & Crèmerie', 'Machin bizarre': 'Autre',
  };
  for (const [name, cat] of Object.entries(expected)) assert.equal(findCategory(name), cat, name);
});

test('parseur : quantités, unités, formats', () => {
  const cases = {
    '2kg tomates': [2, 'kg', 'Tomates'], 'tomates 2kg': [2, 'kg', 'Tomates'],
    'oeufs x6': [6, '', 'Oeufs'], '1,5L lait': [1.5, 'l', 'Lait'],
    '300g de farine': [300, 'g', 'Farine'], '2 boîtes de thon': [2, 'boîte', 'Thon'],
    '1/2 chou': [0.5, '', 'Chou'], 'Pack de 6 yaourts': [6, '', 'Yaourts'],
    'des tomates': [1, '', 'Tomates'], 'sopalin 3 rouleaux': [3, 'rouleau', 'Sopalin'],
  };
  for (const [input, [qty, unit, name]] of Object.entries(cases)) {
    const p = parseInput(input);
    assert.deepEqual([p.qty, p.unit, p.name], [qty, unit, name], input);
  }
  assert.equal(parseMany('lait, 2 oeufs; pain').length, 3);
  assert.equal(formatQuantity(3, 'boîte'), '3 boîtes');
  const back = parseInput(itemToText({ name: 'Thon', qty: 2, unit: 'boîte' }));
  assert.deepEqual([back.qty, back.unit, back.name], [2, 'boîte', 'Thon']);
});

test('doublons : exact, faute de frappe, produits voisins', () => {
  const list = [{ name: 'Lait' }, { name: 'Tomates cerises' }, { name: 'Oeufs' }, { name: 'Courgette' }];
  const t = (n) => findDuplicate(n, list)?.type ?? null;
  assert.equal(t('lait'), 'exact');
  assert.equal(t('Œuf'), 'exact');
  assert.equal(t('Courgete'), 'similar');
  assert.equal(t('Lait de coco'), null);
  assert.equal(t('Tomate'), null);
  assert.equal(t('Pain'), null);
});

test('questions : ids uniques, sessions complètes, libellés distincts', () => {
  assert.equal(QUESTIONS.length % 20, 0);
  assert.equal(new Set(QUESTIONS.map((q) => q.id)).size, QUESTIONS.length);
  for (const q of QUESTIONS) {
    assert.ok(q.text && q.a && q.b && q.a !== q.b, `question ${q.id}`);
  }
});
