export interface LanguageServerMetadata {
    sourceExtension: string;
    serviceExtension: string;
    generatedParserTarget: string;
    parserPackage?: string;
    compilerPackage?: string;
}

export const EXPECTED_OVS_LANGUAGE_SERVER_METADATA: LanguageServerMetadata = {
    sourceExtension: '.ovs',
    serviceExtension: '.ts',
    generatedParserTarget: '@qin/generated-qin-parser-ts',
    compilerPackage: 'ovs-compiler',
};

export function resolveLanguageServerMetadata(initializationOptions: unknown): LanguageServerMetadata {
    const initMetadata = readInitializationMetadata(initializationOptions);
    const envMetadata = readEnvironmentMetadata();
    if (!initMetadata && !envMetadata) {
        throw new Error('OVS language server requires qin.languageServer initialization metadata or QIN_LSP_* environment metadata');
    }
    if (initMetadata && envMetadata) {
        assertSameMetadata(initMetadata, envMetadata, 'initialization metadata', 'environment metadata');
    }
    const metadata = initMetadata ?? envMetadata;
    assertCompleteMetadata(metadata, 'OVS language server metadata');
    assertSameMetadata(metadata, EXPECTED_OVS_LANGUAGE_SERVER_METADATA, 'OVS language server metadata', 'OVS language server expected metadata');
    return metadata;
}

export function extensionWithoutDot(extension: string): string {
    return extension.startsWith('.') ? extension.slice(1) : extension;
}

function readInitializationMetadata(initializationOptions: unknown): LanguageServerMetadata | undefined {
    const metadata = readObject(readObject(initializationOptions)?.qin)?.languageServer;
    return readMetadataObject(metadata);
}

function readEnvironmentMetadata(): LanguageServerMetadata | undefined {
    return readMetadataObject({
        sourceExtension: process.env.QIN_LSP_SOURCE_EXTENSION,
        serviceExtension: process.env.QIN_LSP_SERVICE_EXTENSION,
        generatedParserTarget: process.env.QIN_LSP_GENERATED_PARSER_TARGET,
        parserPackage: process.env.QIN_LSP_PARSER_PACKAGE,
        compilerPackage: process.env.QIN_LSP_COMPILER_PACKAGE,
    });
}

function readMetadataObject(value: unknown): LanguageServerMetadata | undefined {
    const record = readObject(value);
    if (!record) {
        return undefined;
    }
    const metadata: LanguageServerMetadata = {
        sourceExtension: readString(record.sourceExtension),
        serviceExtension: readString(record.serviceExtension),
        generatedParserTarget: readString(record.generatedParserTarget),
        parserPackage: readString(record.parserPackage),
        compilerPackage: readString(record.compilerPackage),
    };
    return hasAnyMetadataField(metadata) ? metadata : undefined;
}

function assertCompleteMetadata(metadata: LanguageServerMetadata | undefined, label: string): asserts metadata is LanguageServerMetadata {
    if (!metadata) {
        throw new Error(`${label} is required`);
    }
    requireNonBlank(metadata.sourceExtension, `${label}.sourceExtension`);
    requireNonBlank(metadata.serviceExtension, `${label}.serviceExtension`);
    requireNonBlank(metadata.generatedParserTarget, `${label}.generatedParserTarget`);
}

function assertSameMetadata(left: LanguageServerMetadata, right: LanguageServerMetadata, leftLabel: string, rightLabel: string): void {
    const fields: (keyof LanguageServerMetadata)[] = [
        'sourceExtension',
        'serviceExtension',
        'generatedParserTarget',
        'parserPackage',
        'compilerPackage',
    ];
    for (const field of fields) {
        const leftValue = normalizeOptional(left[field]);
        const rightValue = normalizeOptional(right[field]);
        if (leftValue !== rightValue) {
            throw new Error(`${leftLabel}.${field} must match ${rightLabel}.${field}: ${leftValue} !== ${rightValue}`);
        }
    }
}

function requireNonBlank(value: string | undefined, label: string): void {
    if (!value || !value.trim()) {
        throw new Error(`${label} must not be blank`);
    }
}

function hasAnyMetadataField(metadata: LanguageServerMetadata): boolean {
    return Boolean(
        metadata.sourceExtension
            || metadata.serviceExtension
            || metadata.generatedParserTarget
            || metadata.parserPackage
            || metadata.compilerPackage,
    );
}

function readObject(value: unknown): Record<string, unknown> | undefined {
    return value && typeof value === 'object' ? value as Record<string, unknown> : undefined;
}

function readString(value: unknown): string | undefined {
    return typeof value === 'string' ? value : undefined;
}

function normalizeOptional(value: string | undefined): string {
    return value ?? '';
}
