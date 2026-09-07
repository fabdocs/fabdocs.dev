import { ImageResponse } from 'next/og';
import { generate as DefaultImage } from 'fumadocs-ui/og';
import { appName } from '@/lib/shared';

export const alt =
  'fabdocs.dev — the production engineering manual for Microsoft Fabric';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <DefaultImage
        title="The production engineering manual for Microsoft Fabric"
        description="Build, deploy, govern, and scale lakehouses, notebooks, and CI/CD — without burning your capacity budget."
        site={appName}
      />
    ),
    size,
  );
}
