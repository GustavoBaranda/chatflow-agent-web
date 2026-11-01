/**
 * Topic Manifest for chatflow-agent-web.
 *
 * Automatically audited and maintained against authoritative English documentation
 * trees in content/docs/en/.
 *
 * Provides typed, zero-runtime-filesystem topic lookup for deterministic version switching.
 */

import type { DocVersionTrack } from './docs-versions';

export const TRACK_AVAILABLE_TOPICS: Record<DocVersionTrack, readonly string[]> = {
  'v0.3': [
    '',
    'getting-started/core-concepts',
    'getting-started/installation',
    'getting-started/quickstart',
    'guides/agents',
    'guides/multi-agent-handoffs',
    'guides/runner-lifecycle',
    'guides/sessions-state',
    'guides/tools',
    'integrations/telegram',
    'integrations/webhook',
    'integrations/whatsapp',
    'production/configuration',
    'production/deployment',
    'production/error-handling',
    'production/observability',
    'production/security',
    'providers',
    'providers/gemini-anthropic',
    'providers/ollama',
    'providers/openai',
  ],
  'v0.4': [
    '',
    'getting-started/core-concepts',
    'getting-started/installation',
    'getting-started/quickstart',
    'guides/agents',
    'guides/multi-agent-handoffs',
    'guides/runner-lifecycle',
    'guides/sessions-state',
    'guides/tools',
    'integrations/telegram',
    'integrations/webhook',
    'integrations/whatsapp',
    'production/configuration',
    'production/deployment',
    'production/error-handling',
    'production/observability',
    'production/security',
    'providers',
    'providers/gemini-anthropic',
    'providers/ollama',
    'providers/openai',
  ],
};
