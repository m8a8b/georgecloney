# Test Sequences for CloneLab

Use these sequences to test the complete cloning workflow. They contain compatible restriction sites for proper ligation simulation.

## Vector (pUC19-like plasmid)

**Copy and paste this into CloneLab:**

```
>pUC19_test_vector
GAATTCGATATCAAGCTTATCGATACCGTCGACCTGCAGCCAAGCTTGGCACTGGCCGT
CGTTTTACAACGTCGTGACTGGGAAAACCCTGGCGTTACCCAACTTAATCGCCTTGCAG
CACATCCCCCTTTCGCCAGCTGGCGTAATAGCGAAGAGGCCCGCACCGATCGCCCTTCC
CAACAGTTGCGCAGCCTGAATGGCGAATGGCGCTTTGCCTGGTTTCCGGCACCAGAAGC
GGTGCCGGAAAGCTGGCTGGAGTGCGATCTTCCTGAGGCCGATACTGTCGTCGTCCCCT
CAAACTGGCAGATGCACGGTTACGATGCGCCCATCTACACCAACGTGACCTATCCCATT
ACGGTCAATCCGCCGTTTGTTCCCACGGAGAATCCGACGGGTTGTTACTCGCTCACATT
TAATGTTGATGAAAGCTGGCTACAGGAAGGCCAGACGCGAATTATTTTTGATGGCGTTC
CTATTGGTTAAAAAATGAGCTGATTTAACAAAAATTTAACGCGAATTTTAACAAAATAG
```

**Settings:**
- Role: `Vector`
- Topology: `Circular`

**Compatible Enzymes:** EcoRI, BamHI, HindIII, PstI, SalI

---

## Insert (GFP gene)

**Copy and paste this into CloneLab:**

```
>GFP_insert_with_sites
GAATTCATGAGTAAAGGAGAAGAACTTTTCACTGGAGTTGTCCCAATTCTTGTTGAATT
AGATGGTGATGTTAATGGGCACAAATTTTCTGTCAGTGGAGAGGGTGAAGGTGATGCAA
CATACGGAAAACTTACCCTTAAATTTATTTGCACTACTGGAAAACTACCTGTTCCATGG
CCAACACTTGTCACTACTTTCTCTTATGGTGTTCAATGCTTTTCCCGTTATCCGGATCA
CATGAAACGGCATGACTTTTTCAAGAGTGCCATGCCCGAAGGTTATGTACAGGAACGCA
CTATATCTTTCAAAGATGACGGGAACTACAAGACGCGTGCTGAAGTCAAGTTTGAAGGT
GATACCCTTGTTAATCGTATCGAGTTAAAAGGTATTGATTTTAAAGAAGATGGAAACAT
TCTTGGACACAAACTCGAGTACAACTATAACTCACATAATGTATACATCACGGCAGACA
AACAAAAGAATGGAATCAAAGCTAACTTCAAAATTCGCCACAACATTGAAGATGGATCC
GGTCAACTTCAAGATCCGCCACAACATCGAGGGTGGATCCGAATTC
```

**Settings:**
- Role: `Insert`
- Topology: `Linear`

**Compatible Enzymes:** EcoRI, BamHI

**Note:** This insert has EcoRI sites at both ends and BamHI sites near the 3' end, allowing directional cloning.

---

## Workflow Instructions

### 1. Upload Vector
1. Paste the vector sequence above
2. Set Role: `Vector`
3. Set Topology: `Circular`
4. Click **Add Sequence**

### 2. Upload Insert
1. Paste the insert sequence above
2. Set Role: `Insert`
3. Set Topology: `Linear`
4. Click **Add Sequence**

### 3. Analyze Vector
1. Click on the **vector card** to select it
2. Click **Analyze Restriction Sites**
3. You'll see multiple enzymes found including:
   - **EcoRI** (1 site)
   - **HindIII** (1-2 sites)
   - **PstI** (1 site)
   - **BamHI** (if present)

4. **Click on EcoRI** in the Single Cutters list or restriction table
5. It will auto-populate in the Digest Simulator

### 4. Digest Vector
1. With EcoRI already selected, click **Simulate Digest**
2. You'll see 1-2 fragments (depending on topology and sites)
3. Note the largest fragment (this is your vector backbone)

### 5. Analyze Insert
1. Click on the **insert card** to select it
2. Click **Analyze Restriction Sites**
3. You'll see **EcoRI** (2 sites at ends)
4. **Click on EcoRI** to select it

### 6. Digest Insert
1. Click **Simulate Digest**
2. You'll see the insert fragment ready for cloning

### 7. Plan Ligation
Once both are digested, the **Ligation Planner** appears automatically at the bottom!

1. **Select Vector Fragment**: Choose the largest fragment (backbone)
2. **Select Insert Fragment**: Choose your insert fragment
3. **Molar Ratio**: Keep default 3:1 (optimal)
4. Click **Simulate Ligation**

### 8. View Results
You'll see predicted products:

- ✅ **Correct Product** (60% probability) - Desired cloning result
- **Reverse Product** (20%) - Insert in reverse orientation
- **Self-Ligation** (15%) - Vector without insert
- **Concatemer** (5%) - Multiple insert copies

The correct product will be highlighted in green with a "Desired" badge!

---

## Alternative Test: Double Digest

For more complex cloning (directional cloning), try using two enzymes:

### Vector: Digest with `EcoRI, BamHI`
### Insert: Digest with `EcoRI, BamHI`

This creates incompatible ends that force directional insertion (insert can only go in one orientation).

---

## Troubleshooting

**Ligation Planner doesn't appear?**
- Make sure BOTH vector and insert have been digested successfully
- Check that digest results show fragments
- Look at the browser console for errors

**No single cutters found?**
- The sequences above are designed to have single cutters
- Try with  the provided test sequences first
- If using your own sequences, they might genuinely not have single cutters

**Enzyme selection doesn't work?**
- Make sure you've clicked "Analyze Restriction Sites" first
- Click directly on the enzyme name (they're now clickable buttons/rows)
- Check the Digest Simulator input field updates

**Analysis shows old results when switching sequences?**
- This has been fixed - components now reset when switching sequences
- Try refreshing the page if you still see old data
