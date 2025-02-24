import { useAuth } from "@/app/providers/auth-provider";
import { Head } from "@/components/seo";
import { Button } from "@/components/ui/button";
import { ShieldIcon } from "@/components/ui/icons";
import { SHARED_CONTENT } from "@/constants";
import { useLogin } from "@/hooks/use-login";

type ProtectedRouteProps = {
  children: React.ReactNode;
};

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { handleLogin, loading } = useLogin();

  if (!isAuthenticated) {
    return (
      <>
        <Head title="Authentication Required" />
        <section className="mt-20 flex min-h-[80vh] flex-col items-center justify-center gap-y-10">
          <div className="flex flex-col items-center justify-center gap-y-10">
            <div className="flex size-[97px] items-center justify-center rounded-full bg-gray-disabled p-2">
              <ShieldIcon className="size-14" />
            </div>
            <div className="flex flex-col gap-y-10">
              <h1 className="text-center text-body-1 font-semibold text-dark lg:text-title-1">
                {SHARED_CONTENT.protectedPage.messageTitle}
              </h1>
              <p className="lg:text-body2 text-center text-body-2base text-dark">
                {SHARED_CONTENT.protectedPage.messageParagraph}
              </p>
            </div>
          </div>
          <Button
            variant="primary"
            onClick={handleLogin}
            className="max-w-[300px]"
            spinner={loading}
          >
            {loading
              ? SHARED_CONTENT.loginButtonLoading
              : SHARED_CONTENT.protectedPage.ctaButton}
          </Button>
        </section>
      </>
    );
  }
  return children;
};
