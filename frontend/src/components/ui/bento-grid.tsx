import { cn } from "@/lib/utils";

/**
 * BentoGrid component - Responsive grid container for Bento-style card layouts.
 * Uses CSS Grid with automatic rows and responsive columns (1 column mobile, 3 columns desktop).
 *
 * @param props - Component props
 * @param props.className - Optional CSS class names to apply to the grid
 * @param props.children - Child elements (typically BentoGridItem components)
 * @returns React component rendering a grid layout
 */
export const BentoGrid = ({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        "mx-auto grid max-w-7xl grid-cols-1 gap-4 md:auto-rows-[18rem] md:grid-cols-3",
        className,
      )}
    >
      {children}
    </div>
  );
};

/**
 * BentoGridItem component - Individual card item for BentoGrid layout.
 * Features hover effects, optional header, icon, title, and description sections.
 *
 * @param props - Component props
 * @param props.className - Optional CSS class names for styling
 * @param props.title - Title text or React node
 * @param props.description - Description text or React node
 * @param props.header - Optional header content (typically images or media)
 * @param props.icon - Optional icon element
 * @returns React component rendering a grid item card
 */
export const BentoGridItem = ({
  className,
  title,
  description,
  header,
  icon,
}: {
  className?: string;
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  header?: React.ReactNode;
  icon?: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        "group/bento shadow-input row-span-1 flex flex-col justify-between space-y-4 rounded-xl border border-neutral-200 bg-white p-4 transition duration-200 hover:shadow-xl dark:border-white/[0.2] dark:bg-black dark:shadow-none",
        className,
      )}
    >
      {header}
      <div className="transition duration-200 group-hover/bento:translate-x-2">
        {icon}
        <div className="mt-2 mb-2 font-sans font-bold text-neutral-600 dark:text-neutral-200">
          {title}
        </div>
        <div className="font-sans text-xs font-normal text-neutral-600 dark:text-neutral-300">
          {description}
        </div>
      </div>
    </div>
  );
};
