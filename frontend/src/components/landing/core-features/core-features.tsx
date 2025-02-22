import { GuageIcon, LoopIcon, TimerIcon } from "@/components/ui/icons";
import { SHARED_CONTENT } from "@/constants";
import { IconProps } from "@/types";

import styles from "./core-features.module.css";

type TCoreFeatures = {
  title: string;
  icon: React.FC<IconProps>;
};
const coreFeatures: TCoreFeatures[] = [
  {
    title: SHARED_CONTENT.homepage.coreFeatures.featureOne,
    icon: TimerIcon,
  },
  {
    title: SHARED_CONTENT.homepage.coreFeatures.featureTwo,
    icon: GuageIcon,
  },
  {
    title: SHARED_CONTENT.homepage.coreFeatures.featureThree,
    icon: LoopIcon,
  },
];

export const CoreFeatures = () => {
  return (
    <section className={styles.coreFeatures}>
      {coreFeatures.map((feature, id) => (
        <div className={styles.coreFeatureItem} key={`core-feature-${id}`}>
          <div className={styles.coreFeatureIconContainer}>
            <feature.icon className={styles.coreFeatureIcon} />
          </div>
          <h3>{feature.title}</h3>
        </div>
      ))}
    </section>
  );
};
