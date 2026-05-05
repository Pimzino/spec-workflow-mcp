import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  GlobeAltIcon,
  CubeIcon,
  CodeBracketSquareIcon,
  CircleStackIcon,
  LinkIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/solid';
import type {
  ApiEndpoint,
  ComponentInfo,
  FunctionInfo,
  ClassInfo,
  Integration,
} from '../lib/vscode-api';

interface ArtifactSectionProps {
  type: 'apiEndpoints' | 'components' | 'functions' | 'classes' | 'integrations';
  artifacts: any[];
  className?: string;
}

const iconMap = {
  apiEndpoints: GlobeAltIcon,
  components: CubeIcon,
  functions: CodeBracketSquareIcon,
  classes: CircleStackIcon,
  integrations: LinkIcon,
};

const colorMap = {
  apiEndpoints: 'text-blue-500',
  components: 'text-purple-500',
  functions: 'text-green-500',
  classes: 'text-orange-500',
  integrations: 'text-indigo-500',
};

export function ArtifactSection({
  type,
  artifacts,
  className = '',
}: ArtifactSectionProps) {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

  if (!artifacts || artifacts.length === 0) {
    return null;
  }

  const labelMap = {
    apiEndpoints: t('logs.artifacts.apiEndpoints'),
    components: t('logs.artifacts.components'),
    functions: t('logs.artifacts.functions'),
    classes: t('logs.artifacts.classes'),
    integrations: t('logs.artifacts.integrations'),
  };

  const Icon = iconMap[type];
  const label = labelMap[type];
  const color = colorMap[type];

  return (
    <div className={`mb-6 ${className}`}>
      {/* Collapsible Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between hover:opacity-80 transition-opacity py-2 px-3 rounded hover:bg-muted/50"
      >
        <div className="flex items-center gap-2">
          <Icon className={`w-5 h-5 ${color}`} />
          <h3 className={`text-sm font-semibold ${color}`}>
            {label} ({artifacts.length})
          </h3>
        </div>
        {isExpanded ? (
          <ChevronDownIcon className={`w-4 h-4 ${color}`} />
        ) : (
          <ChevronRightIcon className={`w-4 h-4 ${color}`} />
        )}
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="space-y-3 pl-7 mt-3 pt-3 border-t border-muted">
          {type === 'apiEndpoints' && renderApiEndpoints(artifacts as ApiEndpoint[], t)}
          {type === 'components' && renderComponents(artifacts as ComponentInfo[], t)}
          {type === 'functions' && renderFunctions(artifacts as FunctionInfo[], t)}
          {type === 'classes' && renderClasses(artifacts as ClassInfo[], t)}
          {type === 'integrations' && renderIntegrations(artifacts as Integration[], t)}
        </div>
      )}
    </div>
  );
}

function renderApiEndpoints(endpoints: ApiEndpoint[], t: any) {
  return endpoints.map((api, idx) => (
    <div key={idx} className="text-sm">
      <div className="font-mono font-semibold text-blue-600">
        {api.method} {api.path}
      </div>
      <div className="text-xs text-muted-foreground mt-1">{api.purpose}</div>
      {api.requestFormat && (
        <div className="text-xs text-muted-foreground">{t('logs.artifacts.request')} {api.requestFormat}</div>
      )}
      {api.responseFormat && (
        <div className="text-xs text-muted-foreground">{t('logs.artifacts.response')} {api.responseFormat}</div>
      )}
      <div className="text-xs text-gray-500 mt-1 font-mono">{api.location}</div>
    </div>
  ));
}

function renderComponents(components: ComponentInfo[], t: any) {
  return components.map((comp, idx) => (
    <div key={idx} className="text-sm">
      <div className="font-semibold">
        {comp.name} <span className="text-xs text-muted-foreground">({comp.type})</span>
      </div>
      <div className="text-xs text-muted-foreground mt-1">{comp.purpose}</div>
      {comp.props && (
        <div className="text-xs text-muted-foreground">{t('logs.artifacts.props')} {comp.props}</div>
      )}
      {comp.exports && comp.exports.length > 0 && (
        <div className="text-xs text-muted-foreground">
          {t('logs.artifacts.exports')} {comp.exports.join(', ')}
        </div>
      )}
      <div className="text-xs text-gray-500 mt-1 font-mono">{comp.location}</div>
    </div>
  ));
}

function renderFunctions(functions: FunctionInfo[], t: any) {
  return functions.map((func, idx) => (
    <div key={idx} className="text-sm">
      <div className="font-semibold">
        {func.name} {func.isExported && <span className="text-xs text-green-600">{t('logs.artifacts.exported')}</span>}
      </div>
      <div className="text-xs text-muted-foreground mt-1">{func.purpose}</div>
      {func.signature && (
        <div className="text-xs text-muted-foreground font-mono">
          {t('logs.artifacts.signature')} {func.signature}
        </div>
      )}
      <div className="text-xs text-gray-500 mt-1 font-mono">{func.location}</div>
    </div>
  ));
}

function renderClasses(classes: ClassInfo[], t: any) {
  return classes.map((cls, idx) => (
    <div key={idx} className="text-sm">
      <div className="font-semibold">
        {cls.name} {cls.isExported && <span className="text-xs text-green-600">{t('logs.artifacts.exported')}</span>}
      </div>
      <div className="text-xs text-muted-foreground mt-1">{cls.purpose}</div>
      {cls.methods && cls.methods.length > 0 && (
        <div className="text-xs text-muted-foreground">
          {t('logs.artifacts.methods')} {cls.methods.join(', ')}
        </div>
      )}
      <div className="text-xs text-gray-500 mt-1 font-mono">{cls.location}</div>
    </div>
  ));
}

function renderIntegrations(integrations: Integration[], t: any) {
  return integrations.map((intg, idx) => (
    <div key={idx} className="text-sm">
      <div className="font-semibold">{intg.description}</div>
      <div className="text-xs text-muted-foreground mt-1">
        {t('logs.artifacts.frontend')} {intg.frontendComponent}
      </div>
      <div className="text-xs text-muted-foreground">{t('logs.artifacts.backend')} {intg.backendEndpoint}</div>
      <div className="text-xs text-muted-foreground">{t('logs.artifacts.dataFlow')} {intg.dataFlow}</div>
    </div>
  ));
}
