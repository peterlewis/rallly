import { GetServerSideProps } from "next";

import { withUserSession } from "../../components/user-provider";
import { withSessionSsr } from "../../utils/auth";
import { withPageTranslations } from "../../utils/with-page-translations";

const Page = () => {
  return <div>participantlink</div>;
};

export const getServerSideProps: GetServerSideProps = withSessionSsr(
  async (ctx) => {
    const { participantLinkId } = ctx.params;
    return await withPageTranslations(["common", "app", "errors", "timeZones"])(
      ctx,
    );
  },
);

export default withUserSession(Page);
