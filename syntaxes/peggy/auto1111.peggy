// Observations:

// This is a plain key-value pairs list, though it is very hard to parse correctly.

// Lines can be:
// - a positive prompt (it’s a single entry without the key specified)
// - a negative prompt (it’s a single entry with the key “Negative prompt”)
// - an entry list, split by commas

// Pairs can be split by any of:

// - U+200B U+200B U+200B newline
// - comma space

// - Keys can be [\w\s] and will always end with a colon.
//   -  The colon will always have a single space at the right side and never at the left side.

// Values can be:

// - simple strings
// - strings starting with " and ending with "
// - JSON values starting with { and ending with }, though in this case it is important to count the closers until they match the number of openers

// Example:

// score_9, score_8_up, realistic, detailed, 1boy, solo, HuiBuh, bob cut, blunt bangs, dark brown hair, goatee, metal collar, armor, chain, breastplate, aiming, weapon, holding weapon, holding gun, handgun, hand in pocket, outdoors, mountain, moon, castle, backlighting <lora:YusufDikecGunPose_pdxl_Incrs_v1> <lora:hui_buh-v1.2.35-lite>​​​
// Negative prompt: monochrome, blurry, lowres, pixelated, blurred, text, watermark​​​
// Steps: 40, Sampler: Euler a, Schedule type: Beta, CFG scale: 7.0, Seed: 4149569308, Size: 832x1216, Model hash: 5e37c6849c, Model: Pony_Meme_Diffusion_(FallenIncursio)_v2_7PDXL_fp16_pruned, VAE hash: 63aeecb90f, VAE: sdxl_vae.safetensors, Clip skip: 2, Token merging ratio: 0.5, RNG: NV, Hashes: {"model": "67ab2fd8ec", "model:Pony_Meme_Diffusion_(FallenIncursio)_v2_7PDXL_fp16_pruned": "5e37c6849c", "lora:hui_buh_v1.0.11": "0x555b6dd9", "lora:skyd": "768db2a267", "lora:IndexFingerPointingAtSelf_XLPD": "cdc57f4a4b", "lora:fetal_position_pony": "d42bbb83d2", "lora:broly_culo_v1_unpruned": "af0e8a1b9f", "lora:rage_r1": "f5c280a7ed", "lora:YusufDikecGunPose_pdxl_Incrs_v1": "9146bafb28", "lora:BTG": "5679967e4e", "lora:Grocery_store_car_cart_-_XL": "eb6ef85ff9", "lora:Blade_Runner_Meme": "f87e1f0a74", "lora:Wheelchair_XLPD": "6c04bd673a", "lora:cr33pp41ntXLP": "763548df79", "lora:assassinationattemptv1": "c3144507a3", "lora:hui_buh-v1.2.25": "0x8d2205ae", "lora:hui_buh-v1.2.35": "0x2f104b91", "lora:hui_buh-v1.2.35-lite": "0xb9f61b4f", "lora:hui_buh-v1.3.35": "0x8b3accab", "lora:1.3.35-meme-diffusion": "0x90bdd474", "embed:1727C6CDDF61": "1727c6cddf", "embed:29DC1B9B1A2B": "29dc1b9b1a", "embed:AE62180C866B": "ae62180c86", "embed:649C47827D59": "649c47827d", "vae": "63aeecb90f", "vae:sdxl_vae.safetensors": "63aeecb90f"}, Template: "score_9, score_8_up, realistic, detailed, 1boy, solo, HuiBuh, bob cut, blunt bangs, dark brown hair, goatee, metal collar, armor, chain, breastplate, aiming, weapon, holding weapon, holding gun, handgun, hand in pocket, outdoors, mountain, moon, castle, backlighting <lora:YusufDikecGunPose_pdxl_Incrs_v1> <lora:hui_buh-v1.2.35-lite>", Negative Template: "monochrome, blurry, lowres, pixelated, blurred, text, watermark", prompt_cleaning_hook_original_prompt: "1727C6CDDF61 BREAK 1boy, solo, HuiBuh, bob cut, blunt bangs, dark brown hair, goatee, metal collar, armor, chain, breastplate, hud_skyd1ver, skydive, falling, midair, flying, backpack, outdoors, village, sky, day, cloud, trees, panic, scared, stressed <lora:skyd:0.8> <lora:hui_buh_v1.0.11>", prompt_cleaning_hook_original_negative_prompt: "monochrome, blurry, lowres, pixelated, blurred, text, watermark", Lora hashes: "YusufDikecGunPose_pdxl_Incrs_v1: 9146bafb2896, hui_buh-v1.2.35-lite: 0xb9f61b4fb0", Template Generated: "1727C6CDDF61 BREAK 1boy, solo, HuiBuh, bob cut, blunt bangs, dark brown hair, goatee, metal collar, armor, chain, breastplate, hud_skyd1ver, skydive, falling, midair, flying, backpack, outdoors, village, sky, day, cloud, trees, panic, scared, stressed ", Template Seeds: 1732623867, Template Seeds Sub: 1423482226, TI hashes: "1727C6CDDF61: 1727c6cddf61, 1727C6CDDF61: 1727c6cddf61", Beta schedule alpha: 0.6, Beta schedule beta: 0.6, Skip Early CFG: 0.5, NGMS: 1, Pad conds: True, Hardware Info: "RTX 4070 12GB, 9 3900X 12- Processor, 32GB RAM", Time taken: 20.6 sec., Version: v1.10.1-4-g48239090


Document = (Line / BlankLine)*

Line = (PositivePromptLine / NegativePromptLine / EntriesLine) LineEnd

LineEnd = NewLine

NewLine = "\n"

PositivePromptLine = PositivePrompt NewLine

PositivePrompt = Value

NegativePromptLine = NegativePrompt NewLine

NegativePrompt = Value

EntriesLine = Key ":" Value ("," Key ":" Value)* NewLine

Key = Word ":"

Value = SimpleValue / QuotedValue / JSONValue

SimpleValue = Word

QuotedValue = "\"" Word "\""

JSONValue = "{" Word "}"

Word = [a-zA-Z0-9_]+

BlankLine = NewLine
