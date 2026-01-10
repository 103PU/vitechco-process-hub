import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
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
        const where: any = {};

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
            where.tags = {
                some: {
                    tag: {
                        name: tag,
                    },
                },
            };
        }

        // Filter by multiple tags (new feature)
        if (tags && tags.length > 0) {
            where.tags = {
                some: {
                    tag: {
                        name: {
                            in: tags,
                        },
                    },
                },
            };
        }

        // Filter by brandId if provided
        if (brandId) {
            where.machineModels = {
                some: {
                    machineModel: {
                        brandId: brandId,
                    },
                },
            };
        }

        // Filter by specific machine model
        if (modelId) {
            where.machineModels = {
                some: {
                    machineModel: {
                        id: modelId,
                    },
                },
            };
        }

        // Filter by department
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

        return NextResponse.json({
            documents,
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
