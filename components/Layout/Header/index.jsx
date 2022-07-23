import Breadcrumbs from "./Breadcrumbs";
import { useWindowScroll } from "@mantine/hooks";
import { Affix, Transition, Header, Drawer } from "@mantine/core";
import { useState } from "react";
import Sidebar from "../Sidebar";

function HeaderApp({ getBreadcrumbs, title, breadcrumbs }) {
  const [scroll] = useWindowScroll();
  const [opened, setOpened] = useState(false);

  return (
    <>
      <Drawer
        opened={opened}
        onClose={() => setOpened(false)}
        size="sm"
        styles={{ header: { display: "none" } }}
        shadow="xl"
      >
        <Sidebar
          permanentlyExpanded
          width={0}
          onCollapse={() => {
            setOpened(false);
          }}
          hidden={false}
        />
      </Drawer>
      <Affix
        position={{ top: 0, right: 0 }}
        sx={{
          width: "calc(100% - var(--mantine-navbar-width))",
          zIndex: 200,
        }}
      >
        <Transition transition="slide-down" mounted={scroll.y > 40 && !opened}>
          {(transitionStyles) => (
            <Header
              style={{
                ...transitionStyles,
              }}
              px="md"
              py={0}
              sx={(theme) => ({
                boxShadow: theme.shadows.sm,
                paddingTop: theme.spacing.xs / 1.5,
                paddingBottom: theme.spacing.xs / 1.5,
                minHeight: 44.5,
                display: "flex",
                alignItems: "center",
              })}
            >
              <Breadcrumbs
                getBreadcrumbs={getBreadcrumbs}
                breadcrumbs={breadcrumbs}
                setOpened={setOpened}
                sx={{ minWidth: 0 }}
              />
            </Header>
          )}
        </Transition>
      </Affix>

      <Breadcrumbs
        getBreadcrumbs={getBreadcrumbs}
        breadcrumbs={breadcrumbs}
        setOpened={setOpened}
        mb="sm"
      />
    </>
  );
}

export default HeaderApp;
