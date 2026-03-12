const Footer = () => {
  return (
    <footer className="border-t py-4">
      <p className="text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} JejakMasjid · by{" "}
        <a
          href="https://syaqi.dev"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-foreground hover:underline"
        >
          Meraqira
        </a>
      </p>
    </footer>
  );
};

export default Footer;
