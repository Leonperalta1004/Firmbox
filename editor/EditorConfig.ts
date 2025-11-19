// Copyright (c) 2012-2022 John Nesky and contributing authors, distributed under the MIT license, see accompanying the LICENSE.md file.

import { DictionaryArray, BeepBoxOption, InstrumentType, toNameMap, TypePresets } from "../synth/SynthConfig";

export interface PresetCategory extends BeepBoxOption {
    readonly presets: DictionaryArray<Preset>;
}

export interface Preset extends BeepBoxOption {
    readonly isNoise?: boolean;
    readonly isMod?: boolean;
    readonly generalMidi?: boolean;
    readonly midiProgram?: number;
    readonly midiSubharmonicOctaves?: number;
    readonly customType?: InstrumentType;
    readonly settings?: any;
}

export const isMobile: boolean = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|android|ipad|playbook|silk/i.test(navigator.userAgent);

export function prettyNumber(value: number): string {
    return value.toFixed(2).replace(/\.?0*$/, "");
}

export class EditorConfig {
    public static readonly version: string = "-1"; // Using patch versions in display right now, maybe TODAY.
    public static readonly versionDisplayName: string = "FirmBox " + EditorConfig.version;

    public static readonly releaseNotesURL: string = "./patch_notes.html";

    public static readonly isOnMac: boolean = /^Mac/i.test(navigator.platform) || /Mac OS X/i.test(navigator.userAgent) || /^(iPhone|iPad|iPod)/i.test(navigator.platform) || /(iPhone|iPad|iPod)/i.test(navigator.userAgent);
    public static readonly ctrlSymbol: string = EditorConfig.isOnMac ? "⌘" : "Ctrl+";
    public static readonly ctrlName: string = EditorConfig.isOnMac ? "command" : "control";

    public static customSamples: string[] | null;
	
    public static readonly presetCategories: DictionaryArray<PresetCategory> = toNameMap([
        {
        // The order of this array needs to line up with the order of the InstrumentType declarations in SynthConfig.ts. (changes.ts' random instrument generation relies on this, for one.)
            name: "Custom Instruments", presets: <DictionaryArray<Preset>>toNameMap([
                { name: TypePresets[InstrumentType.chip], customType: InstrumentType.chip },
            ])
        },
        {
            name: "Presets? fuck you get creative", presets: <DictionaryArray<Preset>>toNameMap([
                { name: "firm", midiProgram: 80, settings: { "type": "chip", "eqFilter": [], "effects": ["aliasing"], "transition": "interrupt", "fadeInSeconds": 0, "fadeOutTicks": -1, "chord": "arpeggio", "wave": "modbox squaretooth", "unison": "bass", "envelopes": [] } },

                ]) 
            },
    ]);

    public static valueToPreset(presetValue: number): Preset | null {
        const categoryIndex: number = presetValue >> 6;
        const presetIndex: number = presetValue & 0x3F;
        return EditorConfig.presetCategories[categoryIndex]?.presets[presetIndex];
    }

    public static midiProgramToPresetValue(program: number): number | null {
        for (let categoryIndex: number = 0; categoryIndex < EditorConfig.presetCategories.length; categoryIndex++) {
            const category: PresetCategory = EditorConfig.presetCategories[categoryIndex];
            for (let presetIndex: number = 0; presetIndex < category.presets.length; presetIndex++) {
                const preset: Preset = category.presets[presetIndex];
                if (preset.generalMidi && preset.midiProgram == program) return (categoryIndex << 6) + presetIndex;
            }
        }
        return null;
    }

    public static nameToPresetValue(presetName: string): number | null {
        for (let categoryIndex: number = 0; categoryIndex < EditorConfig.presetCategories.length; categoryIndex++) {
            const category: PresetCategory = EditorConfig.presetCategories[categoryIndex];
            for (let presetIndex: number = 0; presetIndex < category.presets.length; presetIndex++) {
                const preset: Preset = category.presets[presetIndex];
                if (preset.name == presetName) return (categoryIndex << 6) + presetIndex;
            }
        }
        return null;
    }

    public static instrumentToPreset(instrument: InstrumentType): Preset | null {
        return EditorConfig.presetCategories[0].presets.dictionary?.[TypePresets?.[instrument]];
    }
}
