/**
 * TokenAnalysisResult - Displays a brief summary of the token analysis.
 * Shows the market brief, key behavioral nudges, and a share button
 * that opens the social media post generation modal.
 */

import { useState } from "react";
import {
  RiCloseLine,
  RiSparklingLine,
  RiShareLine,
} from "@remixicon/react";
import { BlurFade } from "@/components/ui/blur-fade";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SocialShareModal } from "@/features/social";
import type { TokenAnalysis, TokenAnalysisMeta } from "@/types/api";

interface TokenAnalysisResultProps {
  analysis: TokenAnalysis;
  tokenAddress: string;
  meta?: TokenAnalysisMeta | null;
  onClear: () => void;
}

export function TokenAnalysisResult({
  analysis,
  tokenAddress,
  meta,
  onClear,
}: TokenAnalysisResultProps) {
  const [shareModalOpen, setShareModalOpen] = useState(false);

  return (
    <>
      <BlurFade delay={0.1} duration={0.5}>
        <div className="w-full space-y-4 border-t border-border pt-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RiSparklingLine className="size-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">
                Analysis Complete
              </span>
            </div>
            <button
              onClick={onClear}
              type="button"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <RiCloseLine className="size-4" />
            </button>
          </div>

          {/* Market brief */}
          <p className="text-xs leading-relaxed text-muted-foreground">
            {analysis.marketBrief}
          </p>

          {/* Sentiment badge */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Sentiment:</span>
            <Badge
              variant={
                analysis.sentiment.overall === "positive"
                  ? "default"
                  : "secondary"
              }
              className="text-[10px] capitalize"
            >
              {analysis.sentiment.overall}
            </Badge>
          </div>

          {/* Nudges */}
          {analysis.behavioralInsights.nudges.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-medium text-foreground">
                Behavioral Nudges
              </span>
              <ul className="space-y-1.5">
                {analysis.behavioralInsights.nudges.slice(0, 3).map((nudge, i) => (
                  <li
                    key={i}
                    className="text-xs leading-relaxed text-muted-foreground pl-3 border-l-2 border-primary/30"
                  >
                    {nudge}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Reflection prompts */}
          {analysis.behavioralInsights.reflectionPrompts.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-medium text-foreground">
                Reflection
              </span>
              <ul className="space-y-1">
                {analysis.behavioralInsights.reflectionPrompts
                  .slice(0, 2)
                  .map((prompt, i) => (
                    <li
                      key={i}
                      className="text-xs italic text-muted-foreground"
                    >
                      &ldquo;{prompt}&rdquo;
                    </li>
                  ))}
              </ul>
            </div>
          )}

          {/* Share on social media */}
          <div className="pt-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-1.5"
              onClick={() => setShareModalOpen(true)}
            >
              <RiShareLine className="size-3.5" data-icon="inline-start" />
              Share on Social Media
            </Button>
          </div>
        </div>
      </BlurFade>

      {/* Social share modal */}
      <SocialShareModal
        open={shareModalOpen}
        onOpenChange={setShareModalOpen}
        tokenAnalysis={analysis}
        tokenAddress={tokenAddress}
      />
    </>
  );
}
