import Header from "@/components/Header";
import { Box } from "@mantine/core";

export default function Home() {
    return (
        <Box style={{ width: "100vw", height: "100vh", display: "flex", flexDirection: "column" }}>
            <Header />
        </Box>
    );
}
