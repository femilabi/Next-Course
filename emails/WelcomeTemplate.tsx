import {
  Html,
  Body,
  Container,
  Text,
  Link,
  Preview,
  Tailwind,
} from "@react-email/components";

const WelcomeTemplate = ({ name, email }: { name: string; email: string }) => {
  return (
    <Html>
      <Preview>Welcome to our service!</Preview>
      <Tailwind>
        <Body>
          <Container>
            <Text className="text-lg font-bold">Hello {name},</Text>
            <Text>Your email is {email}.</Text>
            <Link href="http://localhost:3030" target="_blank" className="text-blue-500 underline">
              Visit our website
            </Link>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

// const container: React.CSSProperties = {
//   padding: "20px",
//   fontFamily: "Arial, sans-serif",
// };
// const text: React.CSSProperties = {
//   fontSize: "16px",
//   lineHeight: "1.5",
// };

export default WelcomeTemplate;
