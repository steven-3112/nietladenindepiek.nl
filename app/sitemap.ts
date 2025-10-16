import { MetadataRoute } from 'next';
import { getAllBrands, getModelsByBrand } from '@/lib/db';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://nietladenindepiek.nl';

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/indienen`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/over`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];

  // Dynamic pages - all brand/model combinations
  const brands = await getAllBrands();
  const modelPages: MetadataRoute.Sitemap = [];

  for (const brand of brands) {
    const models = await getModelsByBrand(brand.id);
    
    for (const model of models) {
      modelPages.push({
        url: `${baseUrl}/handleiding/${brand.slug}/${model.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.9,
      });
    }
  }

  return [...staticPages, ...modelPages];
}

