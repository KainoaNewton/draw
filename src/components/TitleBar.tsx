import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type TitleBarProps = {
  title?: string;
  ctaLabel?: string;
  ctaLoadingLabel?: string;
  ctaAction?: () => void;
  ctaClassName?: string;
  isCtaVisible?: boolean;
  isCtaDisabled?: boolean;
  isCtaLoading?: boolean;
  titleExtra?: React.ReactNode;
  extra?: React.ReactNode;
};

export default function TitleBar({
  title,
  ctaLabel,
  ctaLoadingLabel,
  ctaAction,
  ctaClassName,
  isCtaVisible,
  isCtaDisabled,
  isCtaLoading,
  titleExtra,
  extra,
}: TitleBarProps) {
  return (
    <div className="mb-4 grid grid-cols-3 gap-4">
      <div className="col-start-2 flex flex-col items-center justify-center">
        <h1 className="text-center font-virgil text-xl font-bold text-text-primary">{title}</h1>
        {titleExtra}
      </div>
      <div className="flex justify-end">
        {extra}
        {isCtaVisible && (
          <Button
            variant="ghost"
            className={cn("w-fit font-medium", ctaClassName)}
            disabled={isCtaDisabled}
            isLoading={isCtaLoading}
            loadingText={ctaLoadingLabel}
            onClick={ctaAction}
          >
            {ctaLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
