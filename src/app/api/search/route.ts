import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import { Prisma } from '@prisma/client';
import { normalizeVietnamese } from '@/lib/utils/vietnamese-text';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q') || '';
        const tag = searchParams.get('tag');
        const tags = searchParams.getAll('tags'); // Support multiple tags
        const brandId = searchParams.get('brandId');
        const modelId = searchParams.get('modelId'); // Machine model filter
        const departmentId = searchParams.get('departmentId'); // Department filter
        const skip = parseInt(searchParams.get('skip') || '0', 10);
        const take = parseInt(searchParams.get('take') || '20', 10);

        // Build the where clause dynamically
        // Build the where clause dynamically
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        // Build the where clause dynamically
        const where: Prisma.DocumentWhereInput = {}; // Complex build, keeping any for now but localized or use strict type if possible
        // Actually, let's use Prisma.DocumentWhereInput but it might be hard to satisfy all conditions dynamically without casting
        // Reverting to localized suppression or better, fixing it properly.
        // Let's try to type it partially or suppress it if it's too dynamic.
        // The error was "Unexpected any".
        // Let's use Prisma.DocumentWhereInput and casting where necessary or just standard object building.

        // Search in title or content if query is provided
        // Supports both original Vietnamese text and normalized text (without diacritics)
        if (query) {
            const normalizedQuery = normalizeVietnamese(query);

            // Search both original query and normalized query
            // This allows "máy" to match "may" and vice versa
            where.OR = [
                { title: { contains: query } },
                { content: { contains: query } },
                // Also search with normalized query if different from original
                ...(normalizedQuery !== query ? [
                    { title: { contains: normalizedQuery } },
                    { content: { contains: normalizedQuery } },
                ] : []),
            ];
        }

        // Filter by single tag (legacy support)
        if (tag) {
            where.technicalMetadata = {
                ...where.technicalMetadata, // Preserve existing
                tags: {
                    some: {
                        tag: {
                            name: tag,
                        },
                    },
                },
            };
        }

        // Filter by multiple tags (new feature)
        if (tags && tags.length > 0) {
            const existingMeta = where.technicalMetadata || {};
            // Merge conditions if needed, but for now simple assignment or merge
            // If we have multiple technicalMetadata filters, we need to be careful.
            // Prisma AND:
            where.AND = [
                ...(where.AND as any[] || []),
                {
                    technicalMetadata: {
                        tags: {
                            some: {
                                tag: {
                                    name: { in: tags }
                                }
                            }
                        }
                    }
                }
            ]
        }

        // Filter by brandId if provided
        if (brandId) {
            where.AND = [
                ...(where.AND as any[] || []),
                {
                    technicalMetadata: {
                        machineModels: {
                            some: {
                                machineModel: {
                                    brandId: brandId,
                                },
                            },
                        }
                    }
                }
            ];
        }

        // Filter by specific machine model
        if (modelId) {
            where.AND = [
                ...(where.AND as any[] || []),
                {
                    technicalMetadata: {
                        machineModels: {
                            some: {
                                machineModel: {
                                    id: modelId,
                                },
                            },
                        }
                    }
                }
            ];
        }

        // Filter by department (Core Field - remains same)
        if (departmentId) {
            where.departments = {
                some: {
                    department: {
                        id: departmentId,
                    },
                },
            };
        }

        // Execute the query with pagination
        // Using select instead of include for performance optimization
        // Excludes heavy 'content' field to reduce response size by ~90%
        const [documents, totalCount] = await Promise.all([
            prisma.document.findMany({
                where,
                select: {
                    id: true,
                    title: true,
                    createdAt: true,
                    updatedAt: true,
                    // Exclude content field to save bandwidth
                    // content: false, // ~50-100KB per document

                    // Include only essential metadata
                    technicalMetadata: {
                        select: {
                            documentType: {
                                select: {
                                    id: true,
                                    name: true,
                                },
                            },
                            topic: {
                                select: {
                                    id: true,
                                    name: true,
                                },
                            },
                            // Limit machine models to first 5 for card display
                            machineModels: {
                                take: 5,
                                select: {
                                    machineModel: {
                                        select: {
                                            id: true,
                                            name: true,
                                            brand: {
                                                select: {
                                                    id: true,
                                                    name: true,
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                            // Limit tags to first 5 for card display
                            tags: {
                                take: 5,
                                select: {
                                    tag: {
                                        select: {
                                            id: true,
                                            name: true,
                                        },
                                    },
                                },
                            },
                        }
                    },

                    // Limit departments to first 3 for card display
                    departments: {
                        take: 3,
                        select: {
                            department: {
                                select: {
                                    id: true,
                                    name: true,
                                },
                            },
                        },
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
                skip,
                take,
            }),
            prisma.document.count({ where }),
        ]);

        // Map Results
        const mappedDocuments = documents.map(doc => ({
            ...doc,
            documentType: doc.technicalMetadata?.documentType ?? null,
            topic: doc.technicalMetadata?.topic ?? null,
            machineModels: doc.technicalMetadata?.machineModels ?? [],
            tags: doc.technicalMetadata?.tags ?? [],
            technicalMetadata: undefined
        }));

        return NextResponse.json({
            documents: mappedDocuments,
            totalCount,
            skip,
            take,
            hasMore: skip + take < totalCount,
        });
    } catch (error) {
        console.error('Failed to fetch search results:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
