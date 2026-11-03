// /deployment: port of site/src/deployment.html. Markup in components/deployment/*, page CSS in ./deployment.css,
// page script in lib/pages/deployment.js (run by DeploymentScript).
import './deployment.css';
import { pageMetadata } from '@/lib/seo';
import JsonLd from '@/components/site/JsonLd';
import DeploymentSprite from '@/components/deployment/DeploymentSprite';
import DeploymentHero from '@/components/deployment/DeploymentHero';
import DeploymentCameras from '@/components/deployment/DeploymentCameras';
import DeploymentEdge from '@/components/deployment/DeploymentEdge';
import DeploymentSecurity from '@/components/deployment/DeploymentSecurity';
import DeploymentScript from '@/components/deployment/DeploymentScript';

export const metadata = pageMetadata('deployment');

export default function DeploymentPage() {
  return (
    <>
      <JsonLd page="deployment" />
      <DeploymentSprite />
      <DeploymentHero />
      <DeploymentCameras />
      <DeploymentEdge />
      <DeploymentSecurity />
      <DeploymentScript />
    </>
  );
}
