import { ReactNode } from "react";

interface PhoneFrameProps {
  children: ReactNode;
}

export const PhoneFrame = ({ children }: PhoneFrameProps) => {
  return (
    <div className="phone-frame-backdrop">
      <div className="phone-frame-device">
        <div className="phone-frame-notch" />
        <div className="phone-frame-screen">{children}</div>
        <div className="phone-frame-home-indicator" />
      </div>
    </div>
  );
};
