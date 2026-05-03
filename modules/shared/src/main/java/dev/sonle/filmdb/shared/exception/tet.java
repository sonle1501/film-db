//package dev.sonle.filmdb.user.api;
//
//import jakarta.servlet.http.HttpServletRequest;
//import jakarta.servlet.http.HttpServletResponse;
//import org.springframework.http.ResponseEntity;
//import org.springframework.security.authentication.AuthenticationManager;
//import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
//import org.springframework.security.core.Authentication;
//import org.springframework.security.core.context.SecurityContext;
//import org.springframework.security.core.context.SecurityContextHolder;
//import org.springframework.security.core.context.SecurityContextHolderStrategy;
//import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
//import org.springframework.security.web.context.SecurityContextRepository;
//import org.springframework.web.bind.annotation.PostMapping;
//import org.springframework.web.bind.annotation.RequestBody;
//import org.springframework.web.bind.annotation.RequestMapping;
//import org.springframework.web.bind.annotation.RestController;
//
//@RestController
//@RequestMapping("/api/v1/auth")
//public class AuthController {
//
//    private final AuthenticationManager authenticationManager;
//
//    // Spring Security 6 requires explicit context saving
//    private final SecurityContextRepository securityContextRepository =
//            new HttpSessionSecurityContextRepository();
//    private final SecurityContextHolderStrategy securityContextHolderStrategy =
//            SecurityContextHolder.getContextHolderStrategy();
//
//    public AuthController(AuthenticationManager authenticationManager) {
//        this.authenticationManager = authenticationManager;
//    }
//
//    @PostMapping("/session-login")
//    public ResponseEntity<?> loginWithSession(@RequestBody LoginRequest loginRequest,
//                                              HttpServletRequest request,
//                                              HttpServletResponse response) {
//
//        // 1. Authenticate the user against the database
//        UsernamePasswordAuthenticationToken token =
//                UsernamePasswordAuthenticationToken.unauthenticated(
//                        loginRequest.getUsername(), loginRequest.getPassword());
//
//        Authentication authentication = authenticationManager.authenticate(token);
//
//        // 2. Set the authentication in the current Security Context
//        SecurityContext context = securityContextHolderStrategy.createEmptyContext();
//        context.setAuthentication(authentication);
//        securityContextHolderStrategy.setContext(context);
//
//        // 3. Save the context. THIS is what triggers Spring Session to write to PostgreSQL
//        // and attach the JSESSIONID cookie to the HttpServletResponse.
//        securityContextRepository.saveContext(context, request, response);
//
//        return ResponseEntity.ok("Login successful. Session created in PostgreSQL.");
//    }
//}