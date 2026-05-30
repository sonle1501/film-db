To resolve term-frequency dominance issues where shorter, exact phrase matches are penalized by standard English stemmers, the text relevance computation combines multi-vector dictionary validation with character boundary mapping.

$$\text{FinalScore} = \text{TextScore} \times \text{PopularityBoostMultiplier}$$

### A. The Component Architecture of $\text{TextScore}$

The text matching engine aggregates similarities across three distinct text representations:

$$\text{TextScore} = 0.2 \cdot \text{Rank}_{\text{english}} + 0.4 \cdot \text{Rank}_{\text{simple}} + 0.4 \cdot \text{Sim}_{\text{trgm}} + \text{Bonus}_{\text{prefix}} + \text{Bonus}_{\text{position}}$$

- **$\text{Rank}_{\text{english}}$ (20% Weight)**: PostgreSQL Full-Text Search utilizing the standard `english` configuration (stemming enabled).
    
- **$\text{Rank}_{\text{simple}}$ (40% Weight)**: PostgreSQL Full-Text Search utilizing the literal `simple` configuration, protecting vital stopwords like "Your" or "The".
    
- **$\text{Sim}_{\text{trgm}}$ (40% Weight)**: Trigram character similarity via `pg_trgm` to ensure typo tolerance.
    
- **$\text{Bonus}_{\text{prefix}}$ (+1.0 Points)**: Applied immediately if the primary title starts exactly with the user's raw query string.
    
- **$\text{Bonus}_{\text{position}}$ (Dynamic Substring Bonus)**: Prioritizes early word appearances by checking if the query exists as a substring:
    
    $$\text{Bonus}_{\text{position}} = \begin{cases}
    
    \frac{1.0}{\text{strpos}(\text{lower}(\text{title}), \text{lower}(\text{query}))} & \text{if query is a substring} \
    
    0.0 & \text{otherwise}
    
    \end{cases}$$
    

## 3. Tiered Dampening Boost Model (Granular Range Specifications)

The ranking engine uses a deterministic **Tiered Dampening Model**. The rating factor serves strictly as a minor modifier that slightly decreases or modifies the score, ensuring popularity retains heavy precedence.

$$\text{PopularityBoostMultiplier} = P(N) + \left[ W(N) \cdot Q(R) \right]$$

### A. Granular Popularity Base Score Factor ($P(N)$)

Divided into precise brackets to systematically isolate unverified materials while allowing popular content to scale naturally upwards:

$$P(N) = \begin{cases}

0.10 & \text{if } N < 100 \

0.25 & \text{if } 100 \le N < 300 \

0.40 & \text{if } 300 \le N < 500 \

0.60 & \text{if } 500 \le N < 1000 \

0.80 & \text{if } 1000 \le N < 5000 \

1.00 & \text{if } 5000 \le N < 10000 \

1.20 + \min\left(1.8, \frac{\log_{10}(N / 10000)}{\log_{10}(100)}\right) & \text{if } N \ge 10000

\end{cases}$$

### B. Dynamic Dampening Gate Switch Factor ($W(N)$)

A safety valve that controls how much a title's rating is allowed to alter its baseline boost:

$$W(N) = \begin{cases}

0.0 & \text{if } N < 100 \

0.3 & \text{if } 100 \le N < 500 \

0.6 & \text{if } 500 \le N < 5000 \

1.0 & \text{if } N \ge 5000

\end{cases}$$

### C. Rating Quality Factor ($Q(R)$)

Ratings have a tightly capped upside contribution (maximum **+0.3**). Crucially, if a movie's rating falls below 3.0, it turns into a negative penalty (**-0.2**) to pull down the overall multiplier of untrustworthy films:

$$Q(R) = \begin{cases}

-0.20 & \text{if } R < 3.0 \

0.05 & \text{if } 3.0 \le R < 4.0 \

0.15 & \text{if } 4.0 \le R < 5.0 \

0.30 & \text{if } R \ge 5.0

\end{cases}$$