import json
with open('data/migrated_products.json', encoding='utf-8') as f:
    products = json.load(f)
p_by_id = {p['id']: p for p in products}

test_pids = ['g1-p0440', 'g1-p0428', 'g1-p0457', 'g1-p0482', 'g1-p0716', 'g1-p0202', 'g1-p0028',
             'g1-p0061', 'g1-p0026', 'g1-p0002', 'g1-p0781',
             'g1-p0746', 'g1-p0011', 'g1-p0199',
             'g1-p0958', 'g1-p0817', 'g1-p0039', 'g1-p0058', 'g1-p0317',
             'g1-p0036', 'g1-p0332', 'g1-p0304',
             'g1-p0425', 'g1-p0850', 'g1-p0307',
             'g1-p0577', 'g1-p0862',
             'g1-p0022', 'g1-p0043', 'g1-p0035', 'g1-p0032',
             'g1-p0551', 'g1-p0467', 'g1-p0544',
             'g1-p0122', 'g1-p0543', 'g1-p0615', 'g1-p0023', 'g1-p0533', 'g1-p0522', 'g1-p0007',
             'g1-p0117', 'g1-p0090', 'g1-p0105', 'g1-p0276', 'g1-p0528', 'g1-p0293', 'g1-p0311', 'g1-p0273', 'g1-p0541']

for pid in test_pids:
    p = p_by_id.get(pid, {})
    print(pid + ': ' + str(p.get('name')) + ' [' + str(p.get('brand')) + '] -> Category: ' + str(p.get('category_id')))
