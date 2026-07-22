import { useEffect, useState } from 'react';
import { Download, ExternalLink, LifeBuoy, PackageCheck, RefreshCw, Rocket, ShieldCheck, Smartphone } from 'lucide-react';
import { HubPanel, HubStatCard } from '../../components/hub/HubComponents';
import { carregarManifestoPlataforma, PLATFORM_FALLBACK } from '../../services/platformManifestService';

function ExternalAction({ href, icon: Icon, title, description, primary = false, disabled = false }) {
  const className = primary ? 'platform-action primary' : 'platform-action';
  if (disabled || !href) {
    return <div className={`${className} disabled`}><Icon size={21} /><span><strong>{title}</strong><small>{description}</small></span></div>;
  }
  return <a className={className} href={href} target="_blank" rel="noreferrer"><Icon size={21} /><span><strong>{title}</strong><small>{description}</small></span><ExternalLink size={16} /></a>;
}

export default function PlatformCenterModule({ profile, companyName, configuration }) {
  const [manifest, setManifest] = useState(PLATFORM_FALLBACK);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setLoading(true);
    setManifest(await carregarManifestoPlataforma());
    setLoading(false);
  }

  useEffect(() => { refresh(); }, []);

  const modules = configuration?.modulos_ativos || [];
  const portalUrl = import.meta.env.VITE_FIELDCHECK_PORTAL_URL || manifest.portal_url;

  return (
    <section className="content hub-page platform-center">
      <div className="platform-hero">
        <div><span className="eyebrow">Uma conta, toda a operacao</span><h2>Central FieldCheck Pro</h2><p>Aplicativo de campo, portal corporativo, expedicao, licenca, atualizacoes e suporte conectados pela mesma empresa.</p></div>
        <button className="secondary-button" type="button" onClick={refresh} disabled={loading}><RefreshCw size={18} className={loading ? 'spin' : ''} /> Atualizar status</button>
      </div>

      <div className="hub-stat-grid">
        <HubStatCard icon={ShieldCheck} label="Empresa" value={companyName || profile?.empresa || 'Nao vinculada'} detail={`Perfil: ${profile?.perfil || profile?.papel || 'usuario'}`} />
        <HubStatCard icon={PackageCheck} label="Modulos ativos" value={modules.length || 'Padrao'} detail="Controlados por empresa" tone="green" />
        <HubStatCard icon={Smartphone} label="Android" value={`v${manifest.version}`} detail={`Canal ${manifest.channel} • codigo ${manifest.version_code}`} tone="purple" />
        <HubStatCard icon={Rocket} label="Atualizacao" value={manifest.mandatory ? 'Obrigatoria' : 'Opcional'} detail={manifest.source === 'remote' ? 'Manifesto publico sincronizado' : 'Usando configuracao segura local'} tone="amber" />
      </div>

      <div className="platform-action-grid">
        <ExternalAction primary href={manifest.download_page_url} icon={Download} title="Instalar aplicativo" description={`Abrir pagina segura da versao ${manifest.version}`} />
        <ExternalAction href={manifest.expedition_url} icon={PackageCheck} title="Expedicao inteligente" description="Abrir o modulo operacional de pedidos, OFs, lotes e carga" />
        <ExternalAction href={manifest.platform_page_url} icon={Smartphone} title="Como a plataforma funciona" description="Fluxo entre Site, Portal e Aplicativo" />
        <ExternalAction href={manifest.support_url} icon={LifeBuoy} title="Suporte FieldCheck" description="Falar com atendimento e implantacao" />
        <ExternalAction href={portalUrl} disabled={!portalUrl} icon={ExternalLink} title="Endereco definitivo do Portal" description={portalUrl ? 'Abrir este Portal em nova aba' : 'Sera ativado apos a publicacao homologada'} />
      </div>

      <HubPanel title="Onboarding da empresa" subtitle="Sequencia recomendada para colocar uma equipe em operacao." icon={Rocket}>
        <div className="platform-onboarding">
          {[
            ['01', 'Conta e empresa', 'Confirme empresa, responsavel e perfis de acesso.'],
            ['02', 'Equipe e modulos', 'Cadastre tecnicos e libere somente os modulos contratados.'],
            ['03', 'Aplicativo', 'Instale pelo QR ou pagina oficial e entre com a mesma conta.'],
            ['04', 'Primeira operacao', 'Crie uma ordem piloto, execute no app e confira o retorno no Portal.'],
          ].map(([number, title, text]) => <article key={number}><b>{number}</b><div><strong>{title}</strong><p>{text}</p></div></article>)}
        </div>
      </HubPanel>

      {manifest.release_notes?.length ? <HubPanel title="Notas da versao" subtitle={`FieldCheck Pro Android ${manifest.version}`} icon={Smartphone}><ul className="platform-release-notes">{manifest.release_notes.map((note) => <li key={note}>{note}</li>)}</ul></HubPanel> : null}
    </section>
  );
}
